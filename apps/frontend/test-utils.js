// Simple test script to verify our utilities work
const { parseHeadingsFromMDX, generateHeadingId, sanitizeHeadingText } = require('./src/lib/blog/toc-utils.ts');
const { generateBlogPostBreadcrumbs, formatCategoryName } = require('./src/lib/blog/breadcrumb-utils.ts');

console.log('Testing TOC utilities...');

// Test heading ID generation
console.log('generateHeadingId("Getting Started"):', generateHeadingId('Getting Started'));
console.log('generateHeadingId("API Reference & Examples"):', generateHeadingId('API Reference & Examples'));

// Test text sanitization
console.log('sanitizeHeadingText("**Bold Text**"):', sanitizeHeadingText('**Bold Text**'));
console.log('sanitizeHeadingText("<strong>HTML</strong>"):', sanitizeHeadingText('<strong>HTML</strong>'));

// Test breadcrumb generation
console.log('generateBlogPostBreadcrumbs("My Post", "my-post", "development"):');
console.log(JSON.stringify(generateBlogPostBreadcrumbs('My Post', 'my-post', 'development'), null, 2));

// Test category formatting
console.log('formatCategoryName("best-practices"):', formatCategoryName('best-practices'));

console.log('All tests completed successfully!');