const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    likeCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;
