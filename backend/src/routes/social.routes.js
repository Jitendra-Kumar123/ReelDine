const express = require('express');
const {
  followPartner,
  unfollowPartner,
  getFollowing,
  getFollowers,
  checkFollowStatus,
  getSocialStats,
  updatePreferences
} = require('../controllers/social.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validatePreferences } = require('../middlewares/validation.middleware');

const router = express.Router();

// All social routes require authentication
router.use(protect);

// Follow/unfollow routes
router.post('/partners/:partnerId/follow', followPartner);
router.delete('/partners/:partnerId/follow', unfollowPartner);
router.get('/partners/:partnerId/follow-status', checkFollowStatus);

// Following/followers lists
router.get('/users/:userId/following', getFollowing);
router.get('/partners/:partnerId/followers', getFollowers);

// Social stats
router.get('/users/:userId/stats', getSocialStats);

// User preferences
router.put('/preferences', validatePreferences, updatePreferences);

module.exports = router;
