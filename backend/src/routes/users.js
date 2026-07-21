const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ginraide-secret-key-2026';

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

// GET /api/users/:username - Get user profile and their posts
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        role: true,
        bio: true,
        profileImageUrl: true,
        createdAt: true,
        posts: {
          include: {
            author: { select: { username: true } },
            combo: true,
            _count: { select: { comments: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format posts to match feed structure
    const formattedPosts = user.posts.map(post => ({
      id: post.id,
      author: post.author.username,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || post.combo?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      likes: post.likesCount,
      comments: post._count.comments,
      createdAt: post.createdAt,
      combo: post.combo
    }));

    res.json({
      profile: {
        id: user.id,
        username: user.username,
        role: user.role,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt
      },
      posts: formattedPosts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile - Update own profile
router.put('/profile', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { bio, profileImageUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio, profileImageUrl },
      select: { id: true, username: true, role: true, bio: true, profileImageUrl: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
