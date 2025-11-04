const mongoose = require('mongoose');

const commentLikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        required: true
    }
}, {
    timestamps: true
});

const CommentLike = mongoose.model('commentLike', commentLikeSchema);
module.exports = CommentLike;
