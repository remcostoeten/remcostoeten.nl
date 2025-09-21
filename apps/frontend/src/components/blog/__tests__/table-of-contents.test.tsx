/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TOCProvider } from '../toc-context';
import { TableOfContents } from '../table-of-contents';
import { TOCItem } from '@/lib/blog/types';

import { vi } from 'vitest';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

const mockTOCItems: TOCItem[] = [
  {
    id: 'introduction',
    text: 'Introduction',
    level: 1,
    children: [
      {
        id: 'getting-started',
        text: 'Getting Started',
        level: 2,
      },
      {
        id: 'prerequisites',
        text: 'Prerequisites',
        level: 2,
      }
    ]
  },
  {
    id: 'advanced',
    text: 'Advanced Usage',
    level: 1,
  }
];

describe('TableOfContents', () => {
  beforeEach(() => {
    // Mock DOM elements for headings
    document.body.innerHTML = `
      <h1 id="introduction">Introduction</h1>
      <h2 id="getting-started">Getting Started</h2>
      <h2 id="prerequisites">Prerequisites</h2>
      <h1 id="advanced">Advanced Usage</h1>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('renders TOC items correctly', () => {
    render(
      <TOCProvider items={mockTOCItems}>
        <TableOfContents />
      </TOCProvider>
    );

    expect(screen.getByText('On this page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Introduction' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Getting Started' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prerequisites' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advanced Usage' })).toBeInTheDocument();
  });

  it('handles click navigation', () => {
    render(
      <TOCProvider items={mockTOCItems}>
        <TableOfContents />
      </TOCProvider>
    );

    const introductionButton = screen.getByRole('button', { name: 'Introduction' });
    fireEvent.click(introductionButton);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth'
    });
  });

  it('renders nothing when no items provided', () => {
    render(
      <TOCProvider items={[]}>
        <TableOfContents />
      </TOCProvider>
    );

    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  it('applies correct styling for different heading levels', () => {
    render(
      <TOCProvider items={mockTOCItems}>
        <TableOfContents />
      </TOCProvider>
    );

    const introButton = screen.getByRole('button', { name: 'Introduction' });
    const gettingStartedButton = screen.getByRole('button', { name: 'Getting Started' });

    // Level 1 headings should have font-medium class
    expect(introButton).toHaveClass('font-medium');
    
    // Level 2 headings should have text-muted-foreground class
    expect(gettingStartedButton).toHaveClass('text-muted-foreground');
  });
});