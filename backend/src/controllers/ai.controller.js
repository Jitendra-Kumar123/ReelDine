const aiService = require('../services/ai.service');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/error.middleware');

// Generate recipe suggestions based on ingredients
const generateRecipeSuggestions = asyncHandler(async (req, res) => {
  const { ingredients, cuisine, dietaryRestrictions } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Ingredients array is required'
    });
  }

  const suggestions = await aiService.generateRecipeSuggestions(ingredients, cuisine, dietaryRestrictions);

  logger.info(`Generated ${suggestions.length} recipe suggestions for user ${req.user?.id || 'anonymous'}`);

  res.json({
    success: true,
    data: suggestions,
    aiPowered: aiService.isAvailable()
  });
});

// Analyze content trends and provide insights
const analyzeTrends = asyncHandler(async (req, res) => {
  const { content, platform = 'general' } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Content is required for analysis'
    });
  }

  const analysis = await aiService.analyzeTrends(content, platform);

  logger.info(`Analyzed trends for content on ${platform} platform`);

  res.json({
    success: true,
    data: analysis,
    aiPowered: aiService.isAvailable()
  });
});

// Generate video editing and content creation tips
const generateVideoTips = asyncHandler(async (req, res) => {
  const { videoDescription, videoLength = 'short', targetAudience = 'general' } = req.body;

  if (!videoDescription) {
    return res.status(400).json({
      success: false,
      message: 'Video description is required'
    });
  }

  const tips = await aiService.generateVideoTips(videoDescription, videoLength, targetAudience);

  logger.info(`Generated video tips for ${videoLength} format targeting ${targetAudience}`);

  res.json({
    success: true,
    data: tips,
    aiPowered: aiService.isAvailable()
  });
});

// Generate personalized content recommendations
const generateContentRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recentActivity, trendingTopics } = req.body;

  // Get user preferences from database (assuming User model has preferences)
  const User = require('../models/user.model');
  const user = await User.findById(userId).select('preferences');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const recommendations = await aiService.generateContentRecommendations(
    user.preferences,
    recentActivity || [],
    trendingTopics || []
  );

  logger.info(`Generated ${recommendations.length} content recommendations for user ${userId}`);

  res.json({
    success: true,
    data: recommendations,
    aiPowered: aiService.isAvailable()
  });
});

// Generate optimized hashtags for content
const generateHashtags = asyncHandler(async (req, res) => {
  const { content, contentType = 'food', platform = 'instagram' } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Content is required for hashtag generation'
    });
  }

  const hashtags = await aiService.generateHashtags(content, contentType, platform);

  logger.info(`Generated hashtags for ${contentType} content on ${platform}`);

  res.json({
    success: true,
    data: hashtags,
    aiPowered: aiService.isAvailable()
  });
});

// Score content quality and provide feedback
const scoreContentQuality = asyncHandler(async (req, res) => {
  const { title, description, tags, videoLength, cuisine, ingredients, presentation } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  const contentData = {
    title,
    description,
    tags,
    videoLength: videoLength || 60,
    cuisine: cuisine || 'general',
    ingredients,
    presentation: presentation || 'standard'
  };

  const qualityScore = await aiService.scoreContentQuality(contentData);

  logger.info(`Scored content quality for "${title}"`);

  res.json({
    success: true,
    data: qualityScore,
    aiPowered: aiService.isAvailable()
  });
});

// Analyze broader food trends
const analyzeFoodTrends = asyncHandler(async (req, res) => {
  const { contentArray, timeRange = 'month' } = req.body;

  if (!contentArray || !Array.isArray(contentArray) || contentArray.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Content array is required for trend analysis'
    });
  }

  const trendAnalysis = await aiService.analyzeFoodTrends(contentArray, timeRange);

  logger.info(`Analyzed food trends for ${contentArray.length} content pieces over ${timeRange}`);

  res.json({
    success: true,
    data: trendAnalysis,
    aiPowered: aiService.isAvailable()
  });
});

// Generate recipe variations
const generateRecipeVariations = asyncHandler(async (req, res) => {
  const { baseRecipe, constraints = {} } = req.body;

  if (!baseRecipe || !baseRecipe.name) {
    return res.status(400).json({
      success: false,
      message: 'Base recipe with name is required'
    });
  }

  const variations = await aiService.generateRecipeVariations(baseRecipe, constraints);

  logger.info(`Generated ${variations.length} recipe variations for "${baseRecipe.name}"`);

  res.json({
    success: true,
    data: variations,
    aiPowered: aiService.isAvailable()
  });
});

// Get AI service status
const getAIServiceStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      available: aiService.isAvailable(),
      features: [
        'recipe_suggestions',
        'trend_analysis',
        'video_tips',
        'content_recommendations',
        'hashtag_generation',
        'quality_scoring',
        'trend_analysis',
        'recipe_variations'
      ]
    }
  });
});

module.exports = {
  generateRecipeSuggestions,
  analyzeTrends,
  generateVideoTips,
  generateContentRecommendations,
  generateHashtags,
  scoreContentQuality,
  analyzeFoodTrends,
  generateRecipeVariations,
  getAIServiceStatus
};
