// Syntax and Structure Test (no dependencies required)
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Syntax and Structure...\n');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    tests.push({ name, status: 'PASSED' });
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    tests.push({ name, status: 'FAILED', error: error.message });
    failed++;
  }
}

// Test 1: Check if utility files exist
console.log('1. Checking Files...');
test('logger.js exists', () => {
  if (!fs.existsSync('./utils/logger.js')) throw new Error('File not found');
});

test('errorHandler.js exists', () => {
  if (!fs.existsSync('./utils/errorHandler.js')) throw new Error('File not found');
});

test('validator.js exists', () => {
  if (!fs.existsSync('./utils/validator.js')) throw new Error('File not found');
});

test('env.js exists', () => {
  if (!fs.existsSync('./utils/env.js')) throw new Error('File not found');
});

test('response.js exists', () => {
  if (!fs.existsSync('./utils/response.js')) throw new Error('File not found');
});

test('rateLimiter.js exists', () => {
  if (!fs.existsSync('./middleware/rateLimiter.js')) throw new Error('File not found');
});

// Test 2: Check file syntax (basic)
console.log('\n2. Checking Syntax...');
test('logger.js syntax', () => {
  const content = fs.readFileSync('./utils/logger.js', 'utf8');
  if (!content.includes('module.exports')) throw new Error('Missing module.exports');
  if (!content.includes('winston')) throw new Error('Missing winston import');
});

test('errorHandler.js syntax', () => {
  const content = fs.readFileSync('./utils/errorHandler.js', 'utf8');
  if (!content.includes('module.exports')) throw new Error('Missing module.exports');
  if (!content.includes('class ApiError')) throw new Error('Missing ApiError class');
  if (!content.includes('errorHandler')) throw new Error('Missing errorHandler function');
});

test('validator.js syntax', () => {
  const content = fs.readFileSync('./utils/validator.js', 'utf8');
  if (!content.includes('module.exports')) throw new Error('Missing module.exports');
  if (!content.includes('Joi')) throw new Error('Missing Joi import');
  if (!content.includes('validate')) throw new Error('Missing validate function');
});

test('env.js syntax', () => {
  const content = fs.readFileSync('./utils/env.js', 'utf8');
  if (!content.includes('module.exports')) throw new Error('Missing module.exports');
  if (!content.includes('validateEnv')) throw new Error('Missing validateEnv function');
});

test('response.js syntax', () => {
  const content = fs.readFileSync('./utils/response.js', 'utf8');
  if (!content.includes('module.exports')) throw new Error('Missing module.exports');
  if (!content.includes('function success')) throw new Error('Missing success function');
  if (!content.includes('function error')) throw new Error('Missing error function');
});

test('rateLimiter.js syntax', () => {
  const content = fs.readFileSync('./middleware/rateLimiter.js', 'utf8');
  if (!content.includes('module.exports')) throw new Error('Missing module.exports');
  if (!content.includes('rateLimit')) throw new Error('Missing rateLimit import');
  if (!content.includes('apiLimiter')) throw new Error('Missing apiLimiter');
});

// Test 3: Check server.js updates
console.log('\n3. Checking server.js Updates...');
test('server.js has logger import', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes("require('./utils/logger')")) throw new Error('Missing logger import');
});

test('server.js has errorHandler import', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes("require('./utils/errorHandler')")) throw new Error('Missing errorHandler import');
});

test('server.js has rateLimiter import', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes("require('./middleware/rateLimiter')")) throw new Error('Missing rateLimiter import');
});

test('server.js has validateEnv call', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes('validateEnv()')) throw new Error('Missing validateEnv call');
});

test('server.js has errorHandler middleware', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes('app.use(errorHandler)') && !content.includes('app.use(errorHandler)')) {
    throw new Error('Missing errorHandler middleware');
  }
});

test('server.js has rate limiting', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes('apiLimiter')) throw new Error('Missing apiLimiter');
});

test('server.js has CORS fix', () => {
  const content = fs.readFileSync('./server.js', 'utf8');
  if (!content.includes('FRONTEND_URL')) throw new Error('Missing FRONTEND_URL in CORS');
});

// Test 4: Check database.js updates
console.log('\n4. Checking database.js Updates...');
test('database.js has logger import', () => {
  const content = fs.readFileSync('./database.js', 'utf8');
  if (!content.includes("require('./utils/logger')")) throw new Error('Missing logger import');
});

test('database.js has reconnection logic', () => {
  const content = fs.readFileSync('./database.js', 'utf8');
  if (!content.includes('reconnect') || !content.includes('ECONNREFUSED')) {
    throw new Error('Missing reconnection logic');
  }
});

// Test 5: Check package.json
console.log('\n5. Checking package.json...');
test('package.json has express-rate-limit', () => {
  const content = fs.readFileSync('./package.json', 'utf8');
  if (!content.includes('express-rate-limit')) throw new Error('Missing express-rate-limit dependency');
});

test('package.json has joi', () => {
  const content = fs.readFileSync('./package.json', 'utf8');
  if (!content.includes('"joi"')) throw new Error('Missing joi dependency');
});

test('package.json has winston', () => {
  const content = fs.readFileSync('./package.json', 'utf8');
  if (!content.includes('"winston"')) throw new Error('Missing winston dependency');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${passed + failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 All syntax tests passed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Run: npm install (to install dependencies)');
  console.log('2. Set DATABASE_URL in .env file');
  console.log('3. Start server: npm start');
  console.log('4. Test endpoints: curl http://localhost:3002/api/health');
} else {
  console.log('\n⚠️  Some tests failed. Please check the errors above.');
  process.exit(1);
}

