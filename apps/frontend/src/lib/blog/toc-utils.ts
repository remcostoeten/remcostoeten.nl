/**
 * Table of Contents utilities for parsing MDX content and generating TOC data
 */

export interface TOCItem {
  id: string;
  text: string;
  level: number; // 1-6 for h1-h6
  children?: TOCItem[];
}

/**
 * Generates a unique ID for a heading based on its text content
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Sanitizes heading text by removing markdown syntax and HTML tags
 */
export function sanitizeHeadingText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/`(.*?)`/g, '$1') // Remove inline code markdown
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}

/**
 * Parses MDX content and extracts headings to generate TOC structure
 */
export function parseHeadingsFromMDX(content: string, maxDepth: number = 3): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const rawText = match[2];
    
    // Skip headings deeper than maxDepth
    if (level > maxDepth) continue;
    
    const text = sanitizeHeadingText(rawText);
    const id = generateHeadingId(text);
    
    headings.push({
      id,
      text,
      level,
    });
  }

  return buildHierarchicalTOC(headings);
}

/**
 * Builds a hierarchical TOC structure from flat heading list
 */
export function buildHierarchicalTOC(flatHeadings: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const heading of flatHeadings) {
    // Remove items from stack that are at same or deeper level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top level heading
      result.push(heading);
    } else {
      // Child heading
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    stack.push(heading);
  }

  return result;
}

/**
 * Flattens hierarchical TOC structure back to a flat list
 */
export function flattenTOC(toc: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  
  function traverse(items: TOCItem[]) {
    for (const item of items) {
      result.push({
        id: item.id,
        text: item.text,
        level: item.level,
      });
      
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  
  traverse(toc);
  return result;
}

/**
 * Finds a TOC item by ID in hierarchical structure
 */
export function findTOCItemById(toc: TOCItem[], id: string): TOCItem | null {
  for (const item of toc) {
    if (item.id === id) {
      return item;
    }
    
    if (item.children) {
      const found = findTOCItemById(item.children, id);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Gets all heading IDs from TOC structure
 */
export function getAllHeadingIds(toc: TOCItem[]): string[] {
  return flattenTOC(toc).map(item => item.id);
}

/**
 * Parses headings from rendered DOM elements (client-side)
 * Useful for generating TOC from already rendered content
 */
export function parseHeadingsFromDOM(container: HTMLElement, maxDepth: number = 3): TOCItem[] {
  const headingSelectors = Array.from({ length: maxDepth }, (_, i) => `h${i + 1}`).join(', ');
  const headingElements = container.querySelectorAll(headingSelectors);
  
  const headings: TOCItem[] = [];
  
  headingElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1));
    const text = sanitizeHeadingText(element.textContent || '');
    const id = element.id || generateHeadingId(text);
    
    // Ensure the element has an ID for navigation
    if (!element.id) {
      element.id = id;
    }
    
    headings.push({
      id,
      text,
      level,
    });
  });
  
  return buildHierarchicalTOC(headings);
}

/**
 * Validates that all TOC items have corresponding DOM elements
 */
export function validateTOCWithDOM(toc: TOCItem[], container: HTMLElement): boolean {
  const flatTOC = flattenTOC(toc);
  
  return flatTOC.every(item => {
    const element = container.querySelector(`#${item.id}`);
    return element !== null;
  });
}