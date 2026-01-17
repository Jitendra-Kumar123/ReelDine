const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  getNotificationStats
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Mark notifications as read
router.put('/read', markAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Get notification stats
router.get('/stats', getNotificationStats);

module.exports = router;
