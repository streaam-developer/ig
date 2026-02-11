/**
 * Instagram Private API Configuration
 * Load sensitive data from environment variables
 */

require('dotenv').config();

module.exports = {
  // Instagram Credentials
  credentials: {
    username: process.env.IG_USERNAME || '',
    password: process.env.IG_PASSWORD || '',
  },

  // Session Configuration
  session: {
    saveSession: process.env.SAVE_SESSION !== 'false',
    sessionPath: './sessions',
    devicePath: './devices',
  },

  // Rate Limiting & Delays (in milliseconds)
  rateLimit: {
    minDelay: parseInt(process.env.MIN_DELAY) || 5000,
    maxDelay: parseInt(process.env.MAX_DELAY) || 15000,
    storyDelay: parseInt(process.env.STORY_DELAY) || 2000,
    messageDelay: parseInt(process.env.MESSAGE_DELAY) || 3000,
    followDelay: parseInt(process.env.FOLLOW_DELAY) || 8000,
    likeDelay: parseInt(process.env.LIKE_DELAY) || 2000,
    commentDelay: parseInt(process.env.COMMENT_DELAY) || 5000,
  },

  // Proxy Configuration
  proxy: {
    enabled: process.env.PROXY_ENABLED === 'true',
    address: process.env.PROXY_ADDRESS || '',
    port: parseInt(process.env.PROXY_PORT) || 0,
    username: process.env.PROXY_USERNAME || '',
    password: process.env.PROXY_PASSWORD || '',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    saveLogs: process.env.SAVE_LOGS === 'true',
    logPath: './logs',
  },

  // Features
  features: {
    autoLike: process.env.AUTO_LIKE === 'true',
    autoFollow: process.env.AUTO_FOLLOW === 'true',
    autoStory: process.env.AUTO_STORY === 'true',
    autoDM: process.env.AUTO_DM === 'true',
    antiBlock: process.env.ANTI_BLOCK === 'true',
  },

  // API Configuration
  api: {
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retries: parseInt(process.env.API_RETRIES) || 3,
    userAgent: process.env.USER_AGENT || 'Instagram 219.0.0.12.117 Android',
  },

  // Targets
  targets: {
    targetUsername: process.env.TARGET_USERNAME || '',
    hashtags: process.env.HASHTAGS ? process.env.HASHTAGS.split(',') : [],
    commentWords: process.env.COMMENT_WORDS ? process.env.COMMENT_WORDS.split(',') : [],
  },

  // Direct Message Configuration
  dm: {
    messagePath: './data/messages.json',
    welcomeMessage: process.env.WELCOME_MESSAGE || 'Welcome! Thanks for following!',
    autoReply: process.env.AUTO_REPLY === 'true',
  },

  // Media Configuration
  media: {
    uploadPath: './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10000000,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
  },
};
