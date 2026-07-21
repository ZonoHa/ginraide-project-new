const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getPosts);
router.post('/', postController.createPost);
router.post('/:id/like', postController.likePost);
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', postController.addComment);
router.put('/:id', postController.updatePost);
router.put('/:id/toggle-comments', postController.toggleComments);
router.delete('/:id/comments/:commentId', postController.deleteComment);
router.delete('/:id', postController.deletePost);

module.exports = router;
