import { 
  parseHeadingsFromMDX, 
  generateHeadingId, 
  sanitizeHeadingText,
  buildHierarchicalTOC,
  flattenTOC,
  parseHeadingsFromDOM,
  validateTOCWithDOM
} from '../toc-utils';

describe('TOC Utils', () => {
  describe('generateHeadingId', () => {
    it('should generate valid IDs from heading text', () => {
      expect(generateHeadingId('Getting Started')).toBe('getting-started');
      expect(generateHeadingId('API Reference & Examples')).toBe('api-reference-examples');
      expect(generateHeadingId('What is React?')).toBe('what-is-react');
      expect(generateHeadingId('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(generateHeadingId('Hello, World!')).toBe('hello-world');
      expect(generateHeadingId('100% Coverage')).toBe('100-coverage');
      expect(generateHeadingId('Node.js & Express')).toBe('nodejs-express');
    });
  });

  describe('sanitizeHeadingText', () => {
    it('should remove markdown syntax', () => {
      expect(sanitizeHeadingText('**Bold Text**')).toBe('Bold Text');
      expect(sanitizeHeadingText('*Italic Text*')).toBe('Italic Text');
      expect(sanitizeHeadingText('`Code Text`')).toBe('Code Text');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeHeadingText('<strong>Bold</strong>')).toBe('Bold');
      expect(sanitizeHeadingText('<em>Italic</em>')).toBe('Italic');
    });
  });

  describe('parseHeadingsFromMDX', () => {
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

### Configuration

How to configure.

#### Environment Variables

Setting up env vars.

## Conclusion

Final thoughts.
    `;

    it('should parse headings correctly', () => {
      const headings = parseHeadingsFromMDX(sampleMDX);
      
      expect(headings).toHaveLength(3); // Only top-level headings
      expect(headings[0].text).toBe('Introduction');
      expect(headings[0].level).toBe(1);
      expect(headings[1].text).toBe('Getting Started');
      expect(headings[1].level).toBe(2);
      expect(headings[1].children).toHaveLength(2);
    });

    it('should respect maxDepth parameter', () => {
      const headings = parseHeadingsFromMDX(sampleMDX, 2);
      
      // Should not include h4 (Environment Variables)
      const flatHeadings = flattenTOC(headings);
      const h4Headings = flatHeadings.filter(h => h.level === 4);
      expect(h4Headings).toHaveLength(0);
    });
  });

  describe('buildHierarchicalTOC', () => {
    it('should build correct hierarchy', () => {
      const flatHeadings = [
        { id: 'intro', text: 'Introduction', level: 1 },
        { id: 'getting-started', text: 'Getting Started', level: 2 },
        { id: 'prereq', text: 'Prerequisites', level: 3 },
        { id: 'install', text: 'Installation', level: 3 },
        { id: 'advanced', text: 'Advanced', level: 2 },
      ];

      const hierarchical = buildHierarchicalTOC(flatHeadings);
      
      expect(hierarchical).toHaveLength(1); // Only h1
      expect(hierarchical[0].children).toHaveLength(2); // Two h2s
      expect(hierarchical[0].children?.[0].children).toHaveLength(2); // Two h3s under first h2
    });
  });

  describe('parseHeadingsFromDOM', () => {
    beforeEach(() => {
      // Setup DOM
      document.body.innerHTML = '';
    });

    it('should parse headings from DOM elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <h1 id="introduction">Introduction</h1>
        <h2 id="getting-started">Getting Started</h2>
        <h3 id="prerequisites">Prerequisites</h3>
        <h3 id="installation">Installation</h3>
        <h2 id="advanced">Advanced Usage</h2>
      `;

      const headings = parseHeadingsFromDOM(container);
      
      expect(headings).toHaveLength(1); // Only h1
      expect(headings[0].text).toBe('Introduction');
      expect(headings[0].children).toHaveLength(2); // Two h2s
      expect(headings[0].children?.[0].children).toHaveLength(2); // Two h3s under first h2
    });

    it('should generate IDs for headings without them', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <h1>Introduction</h1>
        <h2>Getting Started</h2>
      `;

      const headings = parseHeadingsFromDOM(container);
      
      // Check that IDs were added to the DOM elements
      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      
      expect(h1?.id).toBe('introduction');
      expect(h2?.id).toBe('getting-started');
      expect(headings[0].id).toBe('introduction');
      expect(headings[0].children?.[0].id).toBe('getting-started');
    });

    it('should respect maxDepth parameter', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <h1>Introduction</h1>
        <h2>Getting Started</h2>
        <h3>Prerequisites</h3>
        <h4>Environment</h4>
      `;

      const headings = parseHeadingsFromDOM(container, 2);
      const flatHeadings = flattenTOC(headings);
      
      // Should not include h3 or h4
      expect(flatHeadings.every(h => h.level <= 2)).toBe(true);
    });
  });

  describe('validateTOCWithDOM', () => {
    it('should validate that TOC items have corresponding DOM elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <h1 id="introduction">Introduction</h1>
        <h2 id="getting-started">Getting Started</h2>
      `;

      const toc = [
        {
          id: 'introduction',
          text: 'Introduction',
          level: 1,
          children: [
            {
              id: 'getting-started',
              text: 'Getting Started',
              level: 2,
            }
          ]
        }
      ];

      expect(validateTOCWithDOM(toc, container)).toBe(true);
    });

    it('should return false when TOC items are missing from DOM', () => {
      const container = document.createElement('div');
      container.innerHTML = `<h1 id="introduction">Introduction</h1>`;

      const toc = [
        {
          id: 'introduction',
          text: 'Introduction',
          level: 1,
        },
        {
          id: 'missing-heading',
          text: 'Missing Heading',
          level: 2,
        }
      ];

      expect(validateTOCWithDOM(toc, container)).toBe(false);
    });
  });
});