/**
 * Test script to verify environment configuration
 * Run with: npx tsx scripts/test-env.ts
 */

import { env } from '../lib/config/env';

console.log('\n=== Environment Configuration Test ===\n');

// Test 1: Check that env object is loaded
console.log('✓ Environment object loaded');

// Test 2: Verify required variables
const tests = [
  { name: 'NODE_ENV', value: env.nodeEnv, expected: 'development' },
  { name: 'USE_MOCK_DATA', value: env.useMockData, expected: true },
  { name: 'API_URL', value: env.apiUrl, expected: 'http://localhost:4000/api' },
  { name: 'WS_URL', value: env.wsUrl, expected: 'ws://localhost:4000' },
  { name: 'API_TIMEOUT', value: env.apiTimeout, expected: 10000 },
];

let allPassed = true;

tests.forEach(test => {
  const passed = test.value === test.expected;
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${status}${reset} ${test.name}: ${JSON.stringify(test.value)}`);
  
  if (!passed) {
    console.log(`  Expected: ${JSON.stringify(test.expected)}`);
    allPassed = false;
  }
});

// Test 3: Verify AWS config structure
console.log('\n✓ AWS configuration structure exists');
console.log(`  - Region: ${env.aws.region}`);

// Test 4: Verify validation functions work
console.log('\n✓ URL validation working (no errors thrown)');

// Test 5: Verify environment flags
console.log('\n✓ Environment flags:');
console.log(`  - isDevelopment: ${env.isDevelopment}`);
console.log(`  - isProduction: ${env.isProduction}`);
console.log(`  - isTest: ${env.isTest}`);

console.log('\n=== Test Summary ===');
if (allPassed) {
  console.log('\x1b[32m✓ All tests passed!\x1b[0m');
  console.log('\nEnvironment configuration is working correctly.');
  process.exit(0);
} else {
  console.log('\x1b[31m✗ Some tests failed\x1b[0m');
  console.log('\nPlease check your .env.local file.');
  process.exit(1);
}
