const redis = require('redis');
const config = require('../config/config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: config.redisUrl,
        socket: {
          connectTimeout: 60000,
          lazyConnect: true,
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis retry attempts exhausted');
            return undefined;
          }
          // Reconnect after
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('end', () => {
        logger.info('Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Don't throw error, allow app to continue without cache
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) return null;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, expireInSeconds = 3600) {
    try {
      if (!this.isConnected) return false;
      await this.client.setEx(key, expireInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) return false;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) return false;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async incr(key) {
    try {
      if (!this.isConnected) return null;
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return null;
    }
  }

  async expire(key, seconds) {
    try {
      if (!this.isConnected) return false;
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async keys(pattern) {
    try {
      if (!this.isConnected) return [];
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', error);
      return [];
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }

  // Cache wrapper for functions
  async cached(key, fn, ttl = 3600) {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await fn();
      if (result !== null && result !== undefined) {
        await this.set(key, result, ttl);
      }

      return result;
    } catch (error) {
      logger.error('Cache wrapper error:', error);
      // Fallback to executing function without cache
      return await fn();
    }
  }
}

const cacheService = new CacheService();

module.exports = cacheService;
