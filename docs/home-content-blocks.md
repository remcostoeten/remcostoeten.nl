# Home Content Blocks

This document describes the implementation of content blocks for the home page with idempotent seeding functionality.

## Overview

The home content blocks system provides a way to:
1. Query existing content blocks for the home page
2. Verify that required content structure exists
3. Seed default content blocks if they don't exist
4. Maintain idempotency (safe to run multiple times)

## Database Schema

### Content Blocks Table (`content_blocks`)
- `id` (integer, primary key, auto-increment)
- `pageId` (text, not null) - References the page slug
- `blockType` (text, not null) - Type of content block
- `order` (integer, not null, default 0) - Display order
- `createdAt` (text, not null, default CURRENT_TIMESTAMP)
- `updatedAt` (text, not null, default CURRENT_TIMESTAMP)

### Content Segments Table (`content_segments`)
- `id` (integer, primary key, auto-increment)
- `blockId` (integer, not null) - References content_blocks.id
- `order` (integer, not null, default 0) - Display order within block
- `text` (text, not null) - Content text
- `type` (text, not null, default 'text') - Segment type
- `href` (text, nullable) - Link URL
- `target` (text, nullable) - Link target
- `className` (text, nullable) - CSS class name
- `style` (text, nullable) - Inline styles
- `metadata` (text, nullable) - Additional metadata
- `createdAt` (text, not null, default CURRENT_TIMESTAMP)
- `updatedAt` (text, not null, default CURRENT_TIMESTAMP)

## Default Content Structure

The home page is seeded with 6 blocks:
1. **Heading Block** (blockType: 'heading')
   - Welcome message
2. **Paragraph Block 1** (blockType: 'paragraph')
   - Introduction and expertise
3. **Paragraph Block 2** (blockType: 'paragraph')
   - Technical skills and experience
4. **Paragraph Block 3** (blockType: 'paragraph')
   - Development approach and philosophy
5. **Paragraph Block 4** (blockType: 'paragraph')
   - Activities outside of coding
6. **Paragraph Block 5** (blockType: 'paragraph')
   - Call to action for collaboration

## Files Created

### Scripts
- `scripts/seed-home-content-blocks.ts` - Standalone seeding script
- `scripts/test-home-content-utils.ts` - Test script for utility functions

### Libraries
- `src/lib/cms/seed-home-content.ts` - Utility functions for home content management

### Server Actions
- Added `getHomeContentBlocksAction()` and `ensureHomeContentBlocksAction()` to `src/lib/cms/server-actions.ts`

## Usage

### Command Line
```bash
# Seed home content blocks
npx tsx scripts/seed-home-content-blocks.ts

# Test utility functions
npx tsx scripts/test-home-content-utils.ts
```

### Programmatic Usage
```typescript
import { ensureHomeContentBlocks, getHomeContentBlocks, getHomeContentBlocksWithSegments } from '@/lib/cms/seed-home-content';

// Ensure blocks exist (idempotent)
const blocks = await ensureHomeContentBlocks();

// Get blocks without segments
const blocksOnly = await getHomeContentBlocks();

// Get blocks with segments
const blocksWithSegments = await getHomeContentBlocksWithSegments();
```

### Server Actions
```typescript
import { ensureHomeContentBlocksAction, getHomeContentBlocksAction } from '@/lib/cms/server-actions';

// From server component or API route
const result = await ensureHomeContentBlocksAction();
if (result.success) {
  console.log('Blocks:', result.data);
}
```

## Features

### Idempotency
- The seeding process is idempotent - safe to run multiple times
- Verifies existing content structure before seeding
- Only seeds if content is missing or incomplete

### Validation
- Checks for correct number of blocks (6)
- Verifies block types match expected sequence
- Ensures each block has at least one segment

### Transaction Safety
- Uses database transactions for atomic operations
- Cleans existing data before seeding for consistency
- Rolls back on errors

## Block Types

The required block types in order:
1. `heading` - Main page heading
2. `paragraph` - Text content blocks (5 total)

## Segment Types

Currently supported segment types:
- `text` - Plain text content
- Future: `link`, `image`, `code`, etc.

## Error Handling

All functions include proper error handling:
- Database connection errors
- Transaction rollback on failure
- Detailed error messages for debugging
- Graceful degradation

## Testing

Run the test script to verify functionality:
```bash
npx tsx scripts/test-home-content-utils.ts
```

The test will:
1. Ensure content blocks exist
2. Retrieve blocks with and without segments
3. Display summary of block structure
4. Verify all operations complete successfully
