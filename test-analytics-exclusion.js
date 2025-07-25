// Test script to verify analytics path exclusion works correctly
// Run with: node test-analytics-exclusion.js

const { shouldExcludeFromTracking } = require('./src/modules/analytics/config/excluded-paths.ts');

// Test cases
const testCases = [
  { path: '/analytics', shouldExclude: true },
  { path: '/analytics/dashboard', shouldExclude: true },
  { path: '/analytics/events', shouldExclude: true },
  { path: '/', shouldExclude: false },
  { path: '/about', shouldExclude: false },
  { path: '/contact', shouldExclude: false },
  { path: '/projects', shouldExclude: false }
];

console.log('🧪 Testing Analytics Path Exclusion');
console.log('===================================');

let passed = 0;
let failed = 0;

testCases.forEach(({ path, shouldExclude }) => {
  try {
    const result = shouldExcludeFromTracking(path);
    const success = result === shouldExclude;
    
    console.log(`${success ? '✅' : '❌'} ${path} -> ${result} (expected: ${shouldExclude})`);
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${path} -> ERROR: ${error.message}`);
    failed++;
  }
});

console.log('===================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${testCases.length}`);

if (failed === 0) {
  console.log('🎉 All tests passed! Analytics exclusion is working correctly.');
} else {
  console.log('⚠️  Some tests failed. Please check the implementation.');
}
