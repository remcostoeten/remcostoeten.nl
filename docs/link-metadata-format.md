# Link Segment Metadata Format

## Overview

The link segment metadata format provides a standardized way to store link configuration data in the CMS database. This format uses JSON schema stored in the `metadata` field of content segments with `type: "link"`.

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

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `href` | string | Yes | - | The URL the link points to. Must be a valid URL. |
| `target` | string | No | `"_blank"` | Where to open the link. Valid values: `_blank`, `_self`, `_parent`, `_top` |
| `rel` | string | No | `"noopener noreferrer"` | The relationship between the current page and the linked page |
| `className` | string | No | `"external-link"` | CSS class name(s) to apply to the link element |
| `suffix` | string | No | `" ↗"` | Text to append after the link content (e.g., external link arrow) |

## Usage

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

### Parsing Link Metadata

```typescript
import { parseLinkMetadata } from '@/lib/cms/link-metadata';

const metadataString = '{"href": "https://example.com", "target": "_blank"}';
const metadata = parseLinkMetadata(metadataString);
```

### Serializing Link Metadata

```typescript
import { serializeLinkMetadata } from '@/lib/cms/link-metadata';

const metadata = {
  href: "https://example.com",
  target: "_blank",
  rel: "noopener noreferrer",
  className: "external-link",
  suffix: " ↗"
};

const serialized = serializeLinkMetadata(metadata);
```

## Database Storage

The metadata is stored as a JSON string in the `metadata` field of the `content_segments` table:

```sql
INSERT INTO content_segments (type, text, metadata) VALUES (
  'link',
  'Visit GitHub',
  '{"href": "https://github.com", "target": "_blank", "rel": "noopener noreferrer", "className": "external-link", "suffix": " ↗"}'
);
```

## Rendering

The renderer automatically parses the metadata and applies the configuration:

```tsx
// Input segment with metadata
const segment = {
  id: 1,
  type: 'link',
  content: 'Visit GitHub',
  metadata: '{"href": "https://github.com", "target": "_blank", "className": "github-link", "suffix": " →"}'
};

// Rendered output
<a
  href="https://github.com"
  target="_blank"
  rel="noopener noreferrer"
  className="github-link"
>
  Visit GitHub →
</a>
```

## Benefits

1. **Consistency**: Standardized format across the database
2. **Flexibility**: Configurable link behavior without hardcoding
3. **Maintainability**: Easy to update link styling and behavior
4. **Backward Compatibility**: Falls back to existing `href` and `target` fields if metadata is not present
5. **Type Safety**: Full TypeScript support with validation

## Migration Strategy

For existing link segments without metadata, the renderer will:
1. Use the existing `href` and `target` fields
2. Apply default values for `rel`, `className`, and `suffix`
3. Continue to work without requiring database changes

New link segments should use the metadata format for full configurability.
