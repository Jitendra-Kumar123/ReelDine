import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentModal = ({ isOpen, onClose, foodId, commentsCount, onCommentsCountChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && foodId) {
      fetchComments();
    }
  }, [isOpen, foodId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/comment/${foodId}`, { withCredentials: true });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/comment', {
        foodId,
        text: newComment
      }, { withCredentials: true });

      setComments([response.data.comment, ...comments]);
      setNewComment('');
      onCommentsCountChange(commentsCount + 1);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await axios.put(`http://localhost:3000/api/comment/${commentId}`, {
        text: editText
      }, { withCredentials: true });

      setComments(comments.map(comment =>
        comment._id === commentId ? response.data.comment : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:3000/api/comment/${commentId}`, { withCredentials: true });
      setComments(comments.filter(comment => comment._id !== commentId));
      onCommentsCountChange(commentsCount - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(`http://localhost:3000/api/comment/${commentId}/like`, {}, { withCredentials: true });
      // Refresh comments to get updated like count
      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Comments ({commentsCount})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="border-b pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{comment.user.username}</p>
                    {editingComment === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border rounded resize-none"
                          rows="2"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingComment(null)}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1">{comment.text}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                        {comment.likeCount}
                      </button>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.text);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmitComment} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;