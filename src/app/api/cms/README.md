# CMS API Routes

This directory contains the API routes for the Content Management System (CMS).

## Routes

### GET /api/cms/home

Returns the home page content with all blocks and segments.

**Response:**
```json
{
  "success": true,
  "data": {
    "blocks": [
      {
        "id": "string",
        "segments": [
          {
            "id": "string",
            "type": "string",
            "content": "string"
          }
        ]
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### PATCH /api/cms/segments/[id]

Updates a specific content segment.

**Request Body:**
```json
{
  "content": "Updated content text"
}
```

**Response:**
```json
{
  "success": true,
  "segment": {
    "id": "string",
    "type": "string", 
    "content": "string"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Validation

All API routes use Zod schemas for request and response validation:

- Request bodies are validated against defined schemas
- Response data is validated before sending
- Invalid data returns appropriate error responses

## Error Handling

All routes include comprehensive error handling:
- 400: Bad Request (validation errors)
- 404: Not Found (segment not found)
- 500: Internal Server Error (database or server errors)

## Usage Example

```typescript
// Fetch home page content
const response = await fetch('/api/cms/home');
const data = await response.json();

// Update a segment
const updateResponse = await fetch('/api/cms/segments/segment-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'New content text'
  })
});
```
