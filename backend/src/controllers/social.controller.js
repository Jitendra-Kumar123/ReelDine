const User = require('../models/user.model');
const FoodPartner = require('../models/foodpartner.model');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/error.middleware');

// Follow a food partner
const followPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const userId = req.user.id;

  // Check if partner exists
  const partner = await FoodPartner.findById(partnerId);
  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Food partner not found'
    });
  }

  // Check if user is already following
  const user = await User.findById(userId);
  if (user.following.includes(partnerId)) {
    return res.status(400).json({
      success: false,
      message: 'Already following this partner'
    });
  }

  // Add to user's following list
  user.following.push(partnerId);
  await user.save();

  // Increment partner's follower count
  await FoodPartner.findByIdAndUpdate(partnerId, { $inc: { followersCount: 1 } });

  logger.info(`User ${userId} followed partner ${partnerId}`);

  res.json({
    success: true,
    message: 'Successfully followed partner',
    data: {
      followingCount: user.following.length
    }
  });
});

// Unfollow a food partner
const unfollowPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const userId = req.user.id;

  // Check if partner exists
  const partner = await FoodPartner.findById(partnerId);
  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Food partner not found'
    });
  }

  // Check if user is following
  const user = await User.findById(userId);
  const followingIndex = user.following.indexOf(partnerId);
  if (followingIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'Not following this partner'
    });
  }

  // Remove from user's following list
  user.following.splice(followingIndex, 1);
  await user.save();

  // Decrement partner's follower count
  await FoodPartner.findByIdAndUpdate(partnerId, { $inc: { followersCount: -1 } });

  logger.info(`User ${userId} unfollowed partner ${partnerId}`);

  res.json({
    success: true,
    message: 'Successfully unfollowed partner',
    data: {
      followingCount: user.following.length
    }
  });
});

// Get user's following list
const getFollowing = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(userId).populate({
    path: 'following',
    select: 'name logo description cuisine rating followersCount totalVideos isVerified',
    options: {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit)
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const total = user.following.length;
  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      following: user.following,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

// Get partner's followers
const getFollowers = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const partner = await FoodPartner.findById(partnerId);
  if (!partner) {
    return res.status(404).json({
      success: false,
      message: 'Food partner not found'
    });
  }

  // Get users who follow this partner
  const users = await User.find({
    following: partnerId,
    isActive: true
  })
  .select('fullName avatar bio location preferences.cuisines')
  .sort({ createdAt: -1 })
  .skip((parseInt(page) - 1) * parseInt(limit))
  .limit(parseInt(limit));

  const total = await User.countDocuments({
    following: partnerId,
    isActive: true
  });
  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      followers: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

// Check if user is following a partner
const checkFollowStatus = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);
  const isFollowing = user.following.includes(partnerId);

  res.json({
    success: true,
    data: {
      isFollowing,
      followingCount: user.following.length
    }
  });
});

// Get user's social stats
const getSocialStats = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get following partners' stats
  const followingPartners = await FoodPartner.find({
    _id: { $in: user.following }
  })
  .select('totalVideos followersCount rating')
  .lean();

  const totalFollowingVideos = followingPartners.reduce((sum, partner) => sum + partner.totalVideos, 0);
  const averageFollowingRating = followingPartners.length > 0
    ? followingPartners.reduce((sum, partner) => sum + partner.rating, 0) / followingPartners.length
    : 0;

  res.json({
    success: true,
    data: {
      following: {
        count: user.following.length,
        totalVideos: totalFollowingVideos,
        averageRating: Math.round(averageFollowingRating * 10) / 10
      },
      preferences: user.preferences
    }
  });
});

// Update user preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { cuisines, dietaryRestrictions, favoriteIngredients } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (cuisines !== undefined) updateData['preferences.cuisines'] = cuisines;
  if (dietaryRestrictions !== undefined) updateData['preferences.dietaryRestrictions'] = dietaryRestrictions;
  if (favoriteIngredients !== undefined) updateData['preferences.favoriteIngredients'] = favoriteIngredients;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('preferences');

  logger.info(`User ${userId} updated preferences`);

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.preferences
  });
});

module.exports = {
  followPartner,
  unfollowPartner,
  getFollowing,
  getFollowers,
  checkFollowStatus,
  getSocialStats,
  updatePreferences
};
