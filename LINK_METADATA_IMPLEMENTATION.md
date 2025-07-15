# Link-Segment Metadata Format Implementation

## Overview

This implementation adopts a JSON schema inside the `metadata` key for link segments, providing a standardized and flexible way to configure link behavior while maintaining database consistency with previous conventions.

## JSON Schema

```json
{
  "href": "https://example.com",
  "target": "_blank", 
  "rel": "noopener noreferrer",
  "className": "external-link",
  "suffix": " ↗"
}
```

## Key Features

### 1. Type-Safe Implementation
- Full TypeScript support with Zod validation
- Runtime type checking and parsing
- Compile-time type safety

### 2. Flexible Configuration
- Configurable link target (`_blank`, `_self`, `_parent`, `_top`)
- Customizable rel attributes
- Dynamic CSS class names
- Configurable suffix text (including the arrow)

### 3. Backward Compatibility
- Falls back to existing `href` and `target` fields
- Maintains compatibility with existing link segments
- No breaking changes to current database schema

### 4. Database Consistency
- Uses existing `metadata` field in `content_segments` table
- Maintains previous conventions for data storage
- No database migrations required

## Files Created

### Core Implementation
- `src/lib/cms/link-metadata.ts` - Type definitions and validation
- `src/lib/cms/link-segment-helpers.ts` - Helper functions for creating link segments

### Documentation
- `docs/link-metadata-format.md` - Comprehensive documentation
- `examples/link-metadata-usage.ts` - Usage examples
- `LINK_METADATA_IMPLEMENTATION.md` - Implementation summary

### Updated Files
- `src/lib/cms/types.ts` - Added link metadata types
- `src/lib/cms/renderSegment.tsx` - Updated renderer to use metadata

## Usage Examples

### Creating Link Metadata
```typescript
import { createLinkMetadata } from '@/lib/cms/link-metadata';

const metadata = createLinkMetadata({
  href: "https://github.com/user/repo",
  target: "_blank",
  rel: "noopener noreferrer", 
  className: "github-link",
  suffix: " →"
});
```

### Creating Link Segments
```typescript
import { createExternalLinkSegment } from '@/lib/cms/link-segment-helpers';

const linkSegment = createExternalLinkSegment({
  id: 1,
  content: "Visit GitHub",
  href: "https://github.com",
  customClassName: "github-link hover:underline",
  customSuffix: " →"
});
```

### Database Storage
```sql
INSERT INTO content_segments (type, text, metadata) VALUES (
  'link',
  'Visit GitHub',
  '{"href": "https://github.com", "target": "_blank", "rel": "noopener noreferrer", "className": "external-link", "suffix": " ↗"}'
);
```

## Benefits

1. **Renderer Flexibility**: The renderer can read `suffix` to append the arrow, keeping the DB consistent with previous conventions
2. **Type Safety**: Full TypeScript support with runtime validation
3. **Maintainability**: Easy to update link styling and behavior without code changes
4. **Consistency**: Standardized format across the database
5. **Backward Compatibility**: Existing links continue to work without modification

## Migration Strategy

The implementation provides a seamless migration path:

1. **Existing Links**: Continue to work using `href` and `target` fields
2. **New Links**: Use the metadata format for full configurability
3. **Gradual Migration**: Links can be updated to use metadata as needed
4. **No Breaking Changes**: All existing functionality remains intact

## Architecture Decisions

1. **Metadata Storage**: Uses existing `metadata` field to maintain database consistency
2. **JSON Schema**: Structured format allows for validation and type safety
3. **Suffix Configuration**: Moves hardcoded arrow to configurable metadata
4. **Helper Functions**: Provides convenience functions for common link types
5. **Fallback Strategy**: Graceful degradation for links without metadata

This implementation successfully addresses the requirement to adopt a JSON schema inside the `metadata` key while allowing the renderer to read the `suffix` to append the arrow, keeping the database consistent with previous conventions.
