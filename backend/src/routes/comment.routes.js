const express = require('express');
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// POST /api/comment [protected] - Create a new comment
router.post('/', authMiddleware.authUserMiddleware, commentController.createComment);

// GET /api/comment/:foodId [protected] - Get comments for a food item
router.get('/:foodId', authMiddleware.authUserMiddleware, commentController.getComments);

// PUT /api/comment/:commentId [protected] - Update a comment
router.put('/:commentId', authMiddleware.authUserMiddleware, commentController.updateComment);

// DELETE /api/comment/:commentId [protected] - Delete a comment
router.delete('/:commentId', authMiddleware.authUserMiddleware, commentController.deleteComment);

// POST /api/comment/:commentId/like [protected] - Like/unlike a comment
router.post('/:commentId/like', authMiddleware.authUserMiddleware, commentController.likeComment);

module.exports = router;
