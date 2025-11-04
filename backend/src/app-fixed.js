// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const commentRoutes = require('./routes/comment.routes');

const { securityHeaders, limiter, compressionMiddleware } = require('./middlewares/security.middleware');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./services/logger.service');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(limiter);
app.use(compressionMiddleware);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/videos', express.static(path.join(__dirname, '../../videos')));

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ReelDine API Server",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            food: "/api/food",
            "food-partner": "/api/food-partner",
            comment: "/api/comment"
        }
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);
app.use('/api/comment', commentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
