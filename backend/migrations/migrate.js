const mongoose = require('mongoose');
const config = require('../src/config/config');
const logger = require('../src/utils/logger');

async function runMigrations() {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB for migrations');

    // Add migration logic here
    // For example, create indexes, update documents, etc.

    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
