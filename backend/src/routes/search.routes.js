const express = require('express');
const {
  advancedSearch,
  searchFoodPartners,
  getSearchSuggestions
} = require('../controllers/search.controller');
const { validateSearch } = require('../middlewares/validation.middleware');

const router = express.Router();

// Advanced search for foods
router.get('/foods', validateSearch, advancedSearch);

// Search food partners
router.get('/partners', searchFoodPartners);

// Get search suggestions
router.get('/suggestions', getSearchSuggestions);

module.exports = router;
