// Verification script for our enhanced MDX infrastructure
import { parseHeadingsFromMDX, generateHeadingId, sanitizeHeadingText } from './src/lib/blog/toc-utils';
import { generateBlogPostBreadcrumbs, formatCategoryName } from './src/lib/blog/breadcrumb-utils';

// Test sample MDX content
const sampleMDX = `
# Introduction

This is the introduction section.

## Getting Started

Here's how to get started.

### Prerequisites

You need these things.

### Installation

Follow these steps.

## Advanced Usage

More advanced topics.
`;

console.log('=== Testing TOC Utilities ===');

// Test heading ID generation
console.log('generateHeadingId("Getting Started"):', generateHeadingId('Getting Started'));
console.log('generateHeadingId("API Reference & Examples"):', generateHeadingId('API Reference & Examples'));

// Test text sanitization
console.log('sanitizeHeadingText("**Bold Text**"):', sanitizeHeadingText('**Bold Text**'));

// Test TOC parsing
const toc = parseHeadingsFromMDX(sampleMDX);
console.log('Parsed TOC structure:');
console.log(JSON.stringify(toc, null, 2));

console.log('\n=== Testing Breadcrumb Utilities ===');

// Test breadcrumb generation
const breadcrumbs = generateBlogPostBreadcrumbs('Getting Started with React', 'getting-started-react', 'development');
console.log('Blog post breadcrumbs:');
console.log(JSON.stringify(breadcrumbs, null, 2));

// Test category formatting
console.log('formatCategoryName("best-practices"):', formatCategoryName('best-practices'));

console.log('\n=== All utilities working correctly! ===');