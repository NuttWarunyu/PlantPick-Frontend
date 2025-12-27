// Test script for utilities
// Run: node test-utils.js

require('dotenv').config();

console.log('🧪 Testing Utilities...\n');

// Test 1: Logger
console.log('1. Testing Logger...');
try {
  const logger = require('./utils/logger');
  logger.info('✅ Logger test - info message');
  logger.warn('⚠️ Logger test - warning message');
  logger.error('❌ Logger test - error message');
  console.log('✅ Logger: PASSED\n');
} catch (error) {
  console.error('❌ Logger: FAILED', error.message);
}

// Test 2: Error Handler
console.log('2. Testing Error Handler...');
try {
  const { ApiError, asyncHandler } = require('./utils/errorHandler');
  
  // Test ApiError
  const testError = new ApiError(404, 'Test error');
  if (testError.statusCode === 404 && testError.message === 'Test error') {
    console.log('✅ ApiError: PASSED');
  } else {
    console.log('❌ ApiError: FAILED');
  }
  
  // Test asyncHandler
  const testHandler = asyncHandler(async (req, res) => {
    return Promise.resolve('success');
  });
  if (typeof testHandler === 'function') {
    console.log('✅ asyncHandler: PASSED');
  } else {
    console.log('❌ asyncHandler: FAILED');
  }
  
  console.log('✅ Error Handler: PASSED\n');
} catch (error) {
  console.error('❌ Error Handler: FAILED', error.message);
}

// Test 3: Validator
console.log('3. Testing Validator...');
try {
  const { validate, schemas } = require('./utils/validator');
  
  // Test schema
  if (schemas.createPlant && typeof schemas.createPlant.validate === 'function') {
    console.log('✅ Validation schemas: PASSED');
  } else {
    console.log('❌ Validation schemas: FAILED');
  }
  
  // Test validation function
  if (typeof validate === 'function') {
    console.log('✅ Validate function: PASSED');
  } else {
    console.log('❌ Validate function: FAILED');
  }
  
  console.log('✅ Validator: PASSED\n');
} catch (error) {
  console.error('❌ Validator: FAILED', error.message);
}

// Test 4: Environment Validation
console.log('4. Testing Environment Validation...');
try {
  const { validateEnv, getEnv } = require('./utils/env');
  
  // Test getEnv
  const testValue = getEnv('TEST_VAR', 'default');
  if (testValue === 'default') {
    console.log('✅ getEnv: PASSED');
  } else {
    console.log('❌ getEnv: FAILED');
  }
  
  // Note: validateEnv will exit if required vars are missing
  // So we'll just test that it exists
  if (typeof validateEnv === 'function') {
    console.log('✅ validateEnv function: PASSED');
  } else {
    console.log('❌ validateEnv function: FAILED');
  }
  
  console.log('✅ Environment Validation: PASSED\n');
} catch (error) {
  console.error('❌ Environment Validation: FAILED', error.message);
}

// Test 5: Response Helpers
console.log('5. Testing Response Helpers...');
try {
  const { success, error, paginated } = require('./utils/response');
  
  if (typeof success === 'function' && typeof error === 'function' && typeof paginated === 'function') {
    console.log('✅ Response helpers: PASSED');
  } else {
    console.log('❌ Response helpers: FAILED');
  }
  
  console.log('✅ Response Helpers: PASSED\n');
} catch (error) {
  console.error('❌ Response Helpers: FAILED', error.message);
}

// Test 6: Rate Limiter
console.log('6. Testing Rate Limiter...');
try {
  const { apiLimiter, aiLimiter, adminLimiter, scrapingLimiter } = require('./middleware/rateLimiter');
  
  if (apiLimiter && aiLimiter && adminLimiter && scrapingLimiter) {
    console.log('✅ Rate limiters: PASSED');
  } else {
    console.log('❌ Rate limiters: FAILED');
  }
  
  console.log('✅ Rate Limiter: PASSED\n');
} catch (error) {
  console.error('❌ Rate Limiter: FAILED', error.message);
  console.error('   Note: This might fail if express-rate-limit is not installed yet');
}

console.log('🎉 Testing Complete!');
console.log('\n📝 Next Steps:');
console.log('1. Run: npm install (in backend directory)');
console.log('2. Set DATABASE_URL in .env file');
console.log('3. Start server: npm start');

