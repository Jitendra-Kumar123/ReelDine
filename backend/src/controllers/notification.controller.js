const User = require('../models/user.model');
const FoodPartner = require('../models/foodpartner.model');
const Food = require('../models/food.model');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/error.middleware');

// In-memory notification storage (in production, use Redis or database)
let notifications = new Map();

// WebSocket connections storage
const connectedUsers = new Map();

// Send notification to user
const sendNotification = (userId, notification) => {
  const userConnections = connectedUsers.get(userId);
  if (userConnections) {
    userConnections.forEach(socket => {
      socket.emit('notification', notification);
    });
  }

  // Store notification for later retrieval
  if (!notifications.has(userId)) {
    notifications.set(userId, []);
  }
  notifications.get(userId).push({
    ...notification,
    id: Date.now().toString(),
    read: false,
    createdAt: new Date()
  });

  // Keep only last 100 notifications per user
  if (notifications.get(userId).length > 100) {
    notifications.get(userId).shift();
  }
};

// Create notification for new food post
const notifyNewFoodPost = asyncHandler(async (foodId) => {
  const food = await Food.findById(foodId).populate('foodPartner', 'name');

  if (!food) return;

  // Get users who follow this partner
  const followers = await User.find({
    following: food.foodPartner._id,
    isActive: true
  }).select('_id');

  const notification = {
    type: 'new_food_post',
    title: 'New Food Post',
    message: `${food.foodPartner.name} posted a new dish: ${food.name}`,
    data: {
      foodId: food._id,
      partnerId: food.foodPartner._id,
      foodName: food.name
    },
    createdAt: new Date()
  };

  // Send to all followers
  followers.forEach(user => {
    sendNotification(user._id.toString(), notification);
  });

  logger.info(`Sent new food post notifications for ${food.name} to ${followers.length} followers`);
});

// Create notification for likes
const notifyLike = asyncHandler(async (foodId, likerId) => {
  const food = await Food.findById(foodId).populate('foodPartner', 'name');

  if (!food || food.foodPartner._id.toString() === likerId) return;

  const liker = await User.findById(likerId).select('fullName');

  const notification = {
    type: 'food_liked',
    title: 'Food Liked',
    message: `${liker.fullName} liked your dish: ${food.name}`,
    data: {
      foodId: food._id,
      likerId: likerId,
      foodName: food.name
    },
    createdAt: new Date()
  };

  sendNotification(food.foodPartner._id.toString(), notification);
  logger.info(`Sent like notification for ${food.name} to partner ${food.foodPartner._id}`);
});

// Create notification for comments
const notifyComment = asyncHandler(async (foodId, commenterId, commentText) => {
  const food = await Food.findById(foodId).populate('foodPartner', 'name');

  if (!food || food.foodPartner._id.toString() === commenterId) return;

  const commenter = await User.findById(commenterId).select('fullName');

  const notification = {
    type: 'food_commented',
    title: 'New Comment',
    message: `${commenter.fullName} commented on your dish: ${food.name}`,
    data: {
      foodId: food._id,
      commenterId: commenterId,
      foodName: food.name,
      commentText: commentText.substring(0, 50) + (commentText.length > 50 ? '...' : '')
    },
    createdAt: new Date()
  };

  sendNotification(food.foodPartner._id.toString(), notification);
  logger.info(`Sent comment notification for ${food.name} to partner ${food.foodPartner._id}`);
});

// Create notification for follows
const notifyFollow = asyncHandler(async (followerId, followedPartnerId) => {
  const follower = await User.findById(followerId).select('fullName');
  const partner = await FoodPartner.findById(followedPartnerId).select('name');

  const notification = {
    type: 'new_follower',
    title: 'New Follower',
    message: `${follower.fullName} started following you`,
    data: {
      followerId: followerId,
      partnerId: followedPartnerId
    },
    createdAt: new Date()
  };

  sendNotification(followedPartnerId.toString(), notification);
  logger.info(`Sent follow notification to partner ${followedPartnerId} from ${follower.fullName}`);
});

// Get user's notifications
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  let userNotifications = notifications.get(userId) || [];

  if (unreadOnly === 'true') {
    userNotifications = userNotifications.filter(n => !n.read);
  }

  // Sort by creation date (newest first)
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

  const total = userNotifications.length;
  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      notifications: paginatedNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      unreadCount: userNotifications.filter(n => !n.read).length
    }
  });
});

// Mark notifications as read
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notificationIds } = req.body;

  let userNotifications = notifications.get(userId) || [];

  if (notificationIds && notificationIds.length > 0) {
    // Mark specific notifications as read
    userNotifications.forEach(notification => {
      if (notificationIds.includes(notification.id)) {
        notification.read = true;
      }
    });
  } else {
    // Mark all as read
    userNotifications.forEach(notification => {
      notification.read = true;
    });
  }

  notifications.set(userId, userNotifications);

  const unreadCount = userNotifications.filter(n => !n.read).length;

  res.json({
    success: true,
    message: 'Notifications marked as read',
    data: {
      unreadCount
    }
  });
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  let userNotifications = notifications.get(userId) || [];
  const initialLength = userNotifications.length;

  userNotifications = userNotifications.filter(n => n.id !== notificationId);

  if (userNotifications.length < initialLength) {
    notifications.set(userId, userNotifications);
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
});

// Get notification stats
const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const userNotifications = notifications.get(userId) || [];
  const unreadCount = userNotifications.filter(n => !n.read).length;
  const totalCount = userNotifications.length;

  // Group by type
  const typeStats = userNotifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      total: totalCount,
      unread: unreadCount,
      byType: typeStats
    }
  });
});

// WebSocket connection handler (to be used in socket service)
const handleSocketConnection = (socket, userId) => {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(socket);

  socket.on('disconnect', () => {
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
      }
    }
  });
};

module.exports = {
  sendNotification,
  notifyNewFoodPost,
  notifyLike,
  notifyComment,
  notifyFollow,
  getNotifications,
  markAsRead,
  deleteNotification,
  getNotificationStats,
  handleSocketConnection
};
