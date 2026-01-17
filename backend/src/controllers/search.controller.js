const Food = require('../models/food.model');
const FoodPartner = require('../models/foodpartner.model');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/error.middleware');

// Advanced search with multiple filters
const advancedSearch = asyncHandler(async (req, res) => {
  const {
    q, // general search query
    cuisine,
    location,
    priceRange,
    rating,
    ingredients,
    dietaryRestrictions,
    lat,
    lng,
    radius = 10, // km
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = req.query;

  const cacheKey = `search:${JSON.stringify(req.query)}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true
    });
  }

  // Build search query
  let searchQuery = { isActive: true };

  // Text search
  if (q) {
    searchQuery.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  // Cuisine filter
  if (cuisine) {
    searchQuery.cuisine = { $in: cuisine.split(',') };
  }

  // Location-based search
  if (lat && lng) {
    const radiusInMeters = parseInt(radius) * 1000;
    searchQuery.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radiusInMeters
      }
    };
  }

  // Price range filter
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    if (max) {
      searchQuery.price = { $gte: min, $lte: max };
    } else {
      searchQuery.price = { $gte: min };
    }
  }

  // Rating filter
  if (rating) {
    searchQuery.averageRating = { $gte: parseFloat(rating) };
  }

  // Ingredients filter
  if (ingredients) {
    const ingredientList = ingredients.split(',').map(i => new RegExp(i.trim(), 'i'));
    searchQuery['ingredients.name'] = { $in: ingredientList };
  }

  // Dietary restrictions filter
  if (dietaryRestrictions) {
    const restrictions = dietaryRestrictions.split(',');
    searchQuery.dietaryInfo = { $in: restrictions };
  }

  // Sorting options
  let sortOptions = {};
  switch (sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'rating':
      sortOptions = { averageRating: -1 };
      break;
    case 'price_low':
      sortOptions = { price: 1 };
      break;
    case 'price_high':
      sortOptions = { price: -1 };
      break;
    case 'trending':
      sortOptions = { engagementScore: -1 };
      break;
    case 'distance':
      if (lat && lng) {
        // For distance sorting, we'll handle this after query
        sortOptions = { createdAt: -1 };
      } else {
        sortOptions = { createdAt: -1 };
      }
      break;
    default: // relevance
      sortOptions = { engagementScore: -1, createdAt: -1 };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute search
  const foods = await Food.find(searchQuery)
    .populate('foodPartner', 'name logo rating location businessHours')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Food.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / parseInt(limit));

  // Add distance calculation if location search
  if (lat && lng && sortBy === 'distance') {
    foods.forEach(food => {
      if (food.location && food.location.coordinates) {
        const [foodLng, foodLat] = food.location.coordinates;
        food.distance = calculateDistance(parseFloat(lat), parseFloat(lng), foodLat, foodLng);
      }
    });
    foods.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  const result = {
    foods,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    },
    filters: {
      applied: {
        query: q,
        cuisine,
        location,
        priceRange,
        rating,
        ingredients,
        dietaryRestrictions,
        coordinates: lat && lng ? [parseFloat(lng), parseFloat(lat)] : null,
        radius: parseInt(radius)
      }
    }
  };

  // Cache results for 5 minutes
  await cacheService.set(cacheKey, result, 300);

  res.json({
    success: true,
    data: result,
    cached: false
  });
});

// Search food partners
const searchFoodPartners = asyncHandler(async (req, res) => {
  const {
    q,
    cuisine,
    lat,
    lng,
    radius = 10,
    rating,
    isVerified,
    page = 1,
    limit = 20
  } = req.query;

  const cacheKey = `partners:${JSON.stringify(req.query)}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true
    });
  }

  let searchQuery = { isActive: true };

  // Text search
  if (q) {
    searchQuery.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { address: { $regex: q, $options: 'i' } }
    ];
  }

  // Cuisine filter
  if (cuisine) {
    searchQuery.cuisine = { $in: cuisine.split(',') };
  }

  // Location-based search
  if (lat && lng) {
    const radiusInMeters = parseInt(radius) * 1000;
    searchQuery.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radiusInMeters
      }
    };
  }

  // Rating filter
  if (rating) {
    searchQuery.rating = { $gte: parseFloat(rating) };
  }

  // Verification filter
  if (isVerified !== undefined) {
    searchQuery.isVerified = isVerified === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const partners = await FoodPartner.find(searchQuery)
    .select('name logo description cuisine location rating totalReviews followersCount totalVideos isVerified businessHours')
    .sort({ rating: -1, followersCount: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await FoodPartner.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / parseInt(limit));

  const result = {
    partners,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    }
  };

  await cacheService.set(cacheKey, result, 300);

  res.json({
    success: true,
    data: result,
    cached: false
  });
});

// Get search suggestions
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q, type = 'all' } = req.query;

  if (!q || q.length < 2) {
    return res.json({
      success: true,
      data: { suggestions: [] }
    });
  }

  const suggestions = [];

  if (type === 'all' || type === 'foods') {
    const foodSuggestions = await Food.find({
      isActive: true,
      $or: [
        { name: { $regex: `^${q}`, $options: 'i' } },
        { tags: { $in: [new RegExp(`^${q}`, 'i')] } }
      ]
    })
    .select('name tags cuisine')
    .limit(5)
    .lean();

    suggestions.push(...foodSuggestions.map(f => ({
      type: 'food',
      text: f.name,
      category: f.cuisine,
      tags: f.tags
    })));
  }

  if (type === 'all' || type === 'partners') {
    const partnerSuggestions = await FoodPartner.find({
      isActive: true,
      name: { $regex: `^${q}`, $options: 'i' }
    })
    .select('name cuisine')
    .limit(5)
    .lean();

    suggestions.push(...partnerSuggestions.map(p => ({
      type: 'partner',
      text: p.name,
      category: p.cuisine.join(', ')
    })));
  }

  // Add popular tags
  if (type === 'all' || type === 'tags') {
    const popularTags = await Food.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: `^${q}`, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    suggestions.push(...popularTags.map(t => ({
      type: 'tag',
      text: t._id,
      category: 'tag'
    })));
  }

  res.json({
    success: true,
    data: { suggestions }
  });
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = {
  advancedSearch,
  searchFoodPartners,
  getSearchSuggestions
};
