const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ginraide-secret-key-2026';

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

// Get all posts for the feed
exports.getPosts = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, username: true, profileImageUrl: true }
        },
        combo: true,
        _count: {
          select: { comments: true }
        },
        ...(userId ? { likes: { where: { userId } } } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      authorId: post.author.id,
      author: post.author.username,
      authorImage: post.author.profileImageUrl,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || post.combo?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      commentsEnabled: post.commentsEnabled,
      likes: post.likesCount,
      comments: post._count.comments,
      createdAt: post.createdAt,
      comboId: post.comboId,
      combo: post.combo,
      isLikedByMe: userId && post.likes ? post.likes.length > 0 : false
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, comboId, imageUrl } = req.body;
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        authorId: userId,
        comboId: comboId ? parseInt(comboId) : null
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle Like
exports.likePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId: userId, postId: postId }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { userId_postId: { userId: userId, postId: postId } }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });
      return res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: { userId: userId, postId: postId }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      include: {
        author: { select: { id: true, username: true, profileImageUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { text } = req.body;
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.commentBanUntil && new Date(user.commentBanUntil) > new Date()) {
      return res.status(403).json({ message: 'คุณถูกระงับสิทธิ์การแสดงความคิดเห็น' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        postId: postId,
        authorId: userId
      },
      include: {
        author: { select: { id: true, username: true, profileImageUrl: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content }
    });
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { commentsEnabled: !post.commentsEnabled }
    });
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!post || !comment || comment.postId !== postId) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (user.role !== 'ADMIN' && post.authorId !== userId && comment.authorId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = getUserIdFromToken(req);

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (user.role !== 'ADMIN' && post.authorId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
