# Design Document

## Overview

This design document outlines the enhancements to the existing blog system to improve user experience through automatic table of contents generation, enhanced syntax highlighting with GitHub theme, improved MDX support, breadcrumb navigation, redesigned category overview, and a functional tag system.

The current blog system uses Next.js with MDX for content rendering, and we'll build upon this foundation to add the requested features while maintaining performance and accessibility.

## Architecture

### Current Architecture Analysis
- **Frontend**: Next.js 14 with App Router
- **Content**: MDX files stored in `content/blog/`
- **Rendering**: `next-mdx-remote/rsc` for server-side MDX processing
- **Styling**: Tailwind CSS with custom components
- **Components**: Modular blog components in `src/components/blog/`

### Enhanced Architecture
The enhancements will integrate seamlessly with the existing architecture:

1. **Table of Contents**: Client-side component that parses rendered headings
2. **Syntax Highlighting**: Enhanced CodeBlock component with GitHub theme
3. **MDX Components**: Extended mdx-components with new interactive elements
4. **Navigation**: Breadcrumb component integrated into blog layout
5. **Category System**: Enhanced filtering and display components
6. **Tag System**: Improved tag filtering with dedicated tag pages

## Components and Interfaces

### 1. Table of Contents System

#### `TableOfContents` Component
```typescript
interface TOCItem {
  id: string;
  text: string;
  level: number; // 1-6 for h1-h6
  children?: TOCItem[];
}

interface TableOfContentsProps {
  content: string; // MDX content for parsing
  className?: string;
  maxDepth?: number; // Default: 3
}
```

#### `TOCProvider` Context
```typescript
interface TOCContextValue {
  activeId: string | null;
  items: TOCItem[];
  scrollToHeading: (id: string) => void;
}
```

#### Implementation Strategy
- Parse MDX content on server-side to extract headings
- Generate hierarchical TOC structure
- Use Intersection Observer API for active section tracking
- Smooth scrolling with offset for fixed headers
- Responsive design: sidebar on desktop, collapsible on mobile

### 2. Enhanced Syntax Highlighting

#### `CodeBlock` Component Enhancement
```typescript
interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  theme?: 'github-light' | 'github-dark';
}
```

#### GitHub Theme Integration
- Use `highlight.js` or `prism.js` with GitHub theme
- Support for 50+ programming languages
- Line highlighting and line numbers
- Copy-to-clipboard functionality
- File name display for code blocks

### 3. Enhanced MDX Components

#### New MDX Components
```typescript
// Callout component for notes, warnings, etc.
interface CalloutProps {
  type: 'note' | 'warning' | 'tip' | 'danger';
  title?: string;
  children: React.ReactNode;
}

// Interactive code playground
interface CodePlaygroundProps {
  code: string;
  language: string;
  editable?: boolean;
}

// Image with caption and zoom
interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}
```

### 4. Breadcrumb Navigation

#### `Breadcrumb` Component
```typescript
interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}
```

#### Breadcrumb Structure
- Home → Blog → [Category] → Post Title
- Dynamic generation based on current route
- Schema.org structured data for SEO
- Accessible navigation with proper ARIA labels

### 5. Enhanced Category System

#### `CategoryOverview` Component
```typescript
interface CategoryData {
  name: string;
  slug: string;
  description: string;
  postCount: number;
  color?: string;
  icon?: React.ReactNode;
}

interface CategoryOverviewProps {
  categories: CategoryData[];
  layout: 'grid' | 'list';
  showPostCount?: boolean;
}
```

#### Design Improvements
- Card-based layout with proper spacing
- Visual hierarchy with icons and colors
- Post count indicators
- Hover effects and smooth transitions
- Responsive grid layout

### 6. Tag System Enhancement

#### `TagFilter` Component
```typescript
interface TagData {
  name: string;
  slug: string;
  postCount: number;
  color?: string;
}

interface TagFilterProps {
  tags: TagData[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  maxVisible?: number;
}
```

#### Tag Pages
- Dedicated pages for each tag (`/tags/[tag]`)
- Tag-specific post listings
- Related tags suggestions
- Tag cloud visualization

## Data Models

### Enhanced Blog Post Type
```typescript
interface BlogPost extends TBlogPost {
  headings?: TOCItem[]; // Pre-parsed headings for TOC
  breadcrumbs?: BreadcrumbItem[];
  relatedTags?: TagData[];
  categoryData?: CategoryData;
}
```

### Tag Model
```typescript
interface Tag {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  relatedTags?: string[];
}
```

### Category Model
```typescript
interface Category {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  postCount: number;
  subcategories?: Category[];
}
```

## Error Handling

### TOC Generation Errors
- Graceful fallback when no headings are found
- Handle malformed heading structures
- Skip TOC generation for short posts

### Syntax Highlighting Errors
- Fallback to plain text for unsupported languages
- Error boundaries around code blocks
- Loading states for dynamic highlighting

### Navigation Errors
- 404 handling for invalid tag/category pages
- Breadcrumb fallbacks for missing data
- Graceful degradation for JavaScript-disabled users

## Testing Strategy

### Unit Tests
- TOC parsing and generation logic
- Breadcrumb generation from routes
- Tag and category filtering functions
- MDX component rendering

### Integration Tests
- Full blog post rendering with all enhancements
- Navigation between blog pages
- Filter interactions and state management
- Responsive behavior across devices

### Performance Tests
- TOC generation performance with large posts
- Syntax highlighting load times
- Image loading and optimization
- Bundle size impact analysis

### Accessibility Tests
- Keyboard navigation for TOC
- Screen reader compatibility
- Color contrast for syntax highlighting
- ARIA labels and semantic markup

## Implementation Phases

### Phase 1: Core Infrastructure
1. Enhanced MDX component system
2. TOC parsing and generation utilities
3. Breadcrumb generation logic
4. Base styling and theme updates

### Phase 2: Interactive Features
1. TOC sidebar with active section tracking
2. Enhanced syntax highlighting with GitHub theme
3. Interactive MDX components (callouts, etc.)
4. Copy-to-clipboard functionality

### Phase 3: Navigation and Organization
1. Breadcrumb component integration
2. Enhanced category overview design
3. Tag system implementation
4. Tag and category pages

### Phase 4: Polish and Optimization
1. Performance optimizations
2. Accessibility improvements
3. Mobile responsiveness
4. SEO enhancements

## Performance Considerations

### Bundle Size Optimization
- Code splitting for syntax highlighting themes
- Lazy loading of TOC on scroll
- Dynamic imports for interactive components
- Tree shaking for unused MDX components

### Runtime Performance
- Memoization of TOC generation
- Efficient heading parsing algorithms
- Optimized scroll event handling
- Debounced search and filter operations

### SEO and Core Web Vitals
- Server-side TOC generation for initial render
- Optimized image loading for blog posts
- Minimal layout shift during component loading
- Fast navigation between blog pages

## Security Considerations

### Content Security
- Sanitization of user-generated content in comments
- XSS prevention in MDX rendering
- Safe handling of external links
- Content validation for tag and category names

### Performance Security
- Rate limiting for search operations
- Protection against DoS via complex regex in TOC parsing
- Safe handling of large blog posts
- Memory usage monitoring for TOC generation