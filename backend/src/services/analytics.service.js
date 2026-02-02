const foodModel = require('../models/food.model');
const userModel = require('../models/user.model');
const cacheService = require('./cache.service');

class AnalyticsService {
  async getDashboardStats() {
    const cacheKey = 'dashboard_stats';
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      totalFoods,
      totalViews,
      totalLikes,
      activeUsers,
      trendingFoods
    ] = await Promise.all([
      userModel.countDocuments({ isActive: true }),
      foodModel.countDocuments({ isActive: true }),
      foodModel.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      foodModel.aggregate([{ $group: { _id: null, total: { $sum: '$likeCount' } } }]),
      userModel.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      foodModel.find({ isActive: true }).sort({ viewCount: -1 }).limit(5).populate('foodPartner', 'name')
    ]);

    const stats = {
      totalUsers,
      totalFoods,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      activeUsers,
      trendingFoods
    };

    await cacheService.set(cacheKey, stats, 300); // Cache for 5 minutes
    return stats;
  }

  async getUserEngagement(userId) {
    const userFoods = await foodModel.find({ foodPartner: userId, isActive: true });
    const totalViews = userFoods.reduce((sum, food) => sum + food.viewCount, 0);
    const totalLikes = userFoods.reduce((sum, food) => sum + food.likeCount, 0);
    const totalComments = userFoods.reduce((sum, food) => sum + food.commentsCount, 0);

    return {
      totalFoods: userFoods.length,
      totalViews,
      totalLikes,
      totalComments,
      engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
    };
  }

  async getContentPerformance(contentId) {
    const food = await foodModel.findById(contentId).populate('foodPartner', 'name');
    if (!food) return null;

    return {
      views: food.viewCount,
      likes: food.likeCount,
      saves: food.savesCount,
      comments: food.commentsCount,
      rating: food.averageRating,
      engagementScore: food.engagementScore
    };
  }
}

const analyticsService = new AnalyticsService();

module.exports = analyticsService;
