const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ReelDine',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'reelDine_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // ImageKit
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  },

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Email
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  sessionSecret: process.env.SESSION_SECRET || 'reelDine_session_secret',

  // Rate Limiting
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
    allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/quicktime').split(',')
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
};

module.exports = config;
