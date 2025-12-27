// Environment Variable Validation
const logger = require('./logger');

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL'
];

// Optional but recommended environment variables
const recommendedEnvVars = [
  'OPENAI_API_KEY',
  'GOOGLE_MAPS_API_KEY',
  'FRONTEND_URL',
  'ADMIN_PASSWORD'
];

/**
 * Validate environment variables
 */
function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  const missingRecommended = recommendedEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missing.forEach(key => logger.error(`  - ${key}`));
    logger.error('\nPlease set these variables in your .env file or Railway/Vercel environment variables.');
    process.exit(1);
  }

  if (missingRecommended.length > 0) {
    logger.warn('⚠️  Missing recommended environment variables:');
    missingRecommended.forEach(key => logger.warn(`  - ${key}`));
    logger.warn('Some features may not work without these variables.');
  }

  logger.info('✅ Environment variables validated');
  
  // Log important config (without sensitive data)
  logger.info('Configuration:', {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3002,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGoogleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    frontendUrl: process.env.FRONTEND_URL || 'not set'
  });
}

/**
 * Get environment variable with default value
 */
function getEnv(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key, defaultValue = false) {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get integer environment variable
 */
function getIntEnv(key, defaultValue = null) {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

module.exports = {
  validateEnv,
  getEnv,
  getBoolEnv,
  getIntEnv
};

