const Joi = require('joi');
const { asyncHandler } = require('./error.middleware');

// User registration validation
const validateUserRegistration = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(50).required()
      .messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 50 characters'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email',
        'string.empty': 'Email is required'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
});

// Food partner registration validation
const validateFoodPartnerRegistration = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    contactName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required(),
    address: Joi.string().min(10).max(200).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
});

// Login validation
const validateLogin = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
});

// Food creation validation
const validateFoodCreation = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
});

// Comment validation
const validateComment = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    foodId: Joi.string().required(),
    text: Joi.string().min(1).max(500).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
});

// Search validation
const validateSearch = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    q: Joi.string().optional(),
    cuisine: Joi.string().optional(),
    location: Joi.string().optional(),
    priceRange: Joi.string().valid('budget', 'moderate', 'expensive', 'luxury').optional(),
    rating: Joi.number().min(1).max(5).optional(),
    ingredients: Joi.string().optional(),
    dietaryRestrictions: Joi.string().optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(1).max(100).optional()
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
});

module.exports = {
  validateUserRegistration,
  validateFoodPartnerRegistration,
  validateLogin,
  validateFoodCreation,
  validateComment,
  validateSearch
};
