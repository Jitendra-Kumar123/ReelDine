const express = require('express');
const {
  generateRecipeSuggestions,
  analyzeTrends,
  generateVideoTips,
  generateContentRecommendations,
  generateHashtags,
  scoreContentQuality,
  analyzeFoodTrends,
  generateRecipeVariations,
  getAIServiceStatus
} = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (no auth required)
router.get('/status', getAIServiceStatus);

// Protected routes (require authentication)
router.use(protect);

// AI-powered features
router.post('/recipes/suggestions', generateRecipeSuggestions);
router.post('/content/trends', analyzeTrends);
router.post('/videos/tips', generateVideoTips);
router.post('/content/recommendations', generateContentRecommendations);
router.post('/hashtags/generate', generateHashtags);
router.post('/content/quality-score', scoreContentQuality);
router.post('/trends/analyze', analyzeFoodTrends);
router.post('/recipes/variations', generateRecipeVariations);

module.exports = router;
