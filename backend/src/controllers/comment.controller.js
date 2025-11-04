const Comment = require('../models/comment.model');
const CommentLike = require('../models/commentLike.model');
const foodModel = require('../models/food.model');

async function createComment(req, res) {
    try {
        const { foodId, text } = req.body;
        const user = req.user;

        const comment = await Comment.create({
            user: user._id,
            food: foodId,
            text
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { commentsCount: 1 }
        });

        const populatedComment = await Comment.findById(comment._id).populate('user', 'username');

        res.status(201).json({
            message: "Comment created successfully",
            comment: populatedComment
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating comment", error: error.message });
    }
}

async function getComments(req, res) {
    try {
        const { foodId } = req.params;

        const comments = await Comment.find({ food: foodId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Comments fetched successfully",
            comments
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
}

async function updateComment(req, res) {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const user = req.user;

        const comment = await Comment.findOneAndUpdate(
            { _id: id, user: user._id },
            { text },
            { new: true }
        ).populate('user', 'username');

        if (!comment) {
            return res.status(404).json({ message: "Comment not found or not authorized" });
        }

        res.status(200).json({
            message: "Comment updated successfully",
            comment
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating comment", error: error.message });
    }
}

async function deleteComment(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;

        const comment = await Comment.findOneAndDelete({ _id: id, user: user._id });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found or not authorized" });
        }

        await foodModel.findByIdAndUpdate(comment.food, {
            $inc: { commentsCount: -1 }
        });

        res.status(200).json({
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
}

async function likeComment(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;

        const isAlreadyLiked = await CommentLike.findOne({
            user: user._id,
            comment: id
        });

        if (isAlreadyLiked) {
            await CommentLike.deleteOne({
                user: user._id,
                comment: id
            });

            await Comment.findByIdAndUpdate(id, {
                $inc: { likeCount: -1 }
            });

            return res.status(200).json({
                message: "Comment unliked successfully"
            });
        }

        const like = await CommentLike.create({
            user: user._id,
            comment: id
        });

        await Comment.findByIdAndUpdate(id, {
            $inc: { likeCount: 1 }
        });

        res.status(201).json({
            message: "Comment liked successfully",
            like
        });
    } catch (error) {
        res.status(500).json({ message: "Error liking comment", error: error.message });
    }
}

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    likeComment
};
