const app = require('./src/app');
const connectDB = require('./src/db/db');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');

// Connect to database
connectDB();

// Start server
const server = app.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`🚀 Server is running on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});

module.exports = server;
