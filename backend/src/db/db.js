const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');

function connectDB() {
    mongoose.connect(config.mongodbUri, {
        // Modern connection options
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        logger.info('Connected to MongoDB successfully');
        console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
        logger.error('MongoDB connection error:', err);
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
    });
}

module.exports = connectDB;
