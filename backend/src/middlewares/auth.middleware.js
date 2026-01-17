const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const foodPartnerModel = require('../models/foodpartner.model');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'reelDine_secret_key_2024';

async function authUserMiddleware(req, res, next) {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
}

async function authFoodPartnerMiddleware(req, res, next) {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const foodPartner = await foodPartnerModel.findById(decoded.id);
        if (!foodPartner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Food partner not found.'
            });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (error) {
        console.error('Food partner auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
}

module.exports = {
    authUserMiddleware,
    authFoodPartnerMiddleware
};
