'use client';

import React from 'react';
import { TOCLayout } from './toc-layout';
import { TOCItem } from '@/lib/blog/types';

const demoHeadings: TOCItem[] = [
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
    id: 'main-content',
    text: 'Main Content',
    level: 1,
    children: [
      {
        id: 'features',
        text: 'Features',
        level: 2,
        children: [
          {
            id: 'feature-one',
            text: 'Feature One',
            level: 3,
          },
          {
            id: 'feature-two',
            text: 'Feature Two',
            level: 3,
          }
        ]
      },
      {
        id: 'configuration',
        text: 'Configuration',
        level: 2,
      }
    ]
  },
  {
    id: 'conclusion',
    text: 'Conclusion',
    level: 1,
  }
];

export function TOCDemo() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Table of Contents Demo</h1>
      
      <TOCLayout headings={demoHeadings}>
        <article className="space-y-8">
          <section>
            <h1 id="introduction">Introduction</h1>
            <p>This is the introduction section. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            
            <h2 id="getting-started">Getting Started</h2>
            <p>Here's how to get started with this amazing feature. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            
            <h2 id="prerequisites">Prerequisites</h2>
            <p>Before you begin, make sure you have these prerequisites installed. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
          </section>

          <section>
            <h1 id="main-content">Main Content</h1>
            <p>This is the main content section with detailed information. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            
            <h2 id="features">Features</h2>
            <p>Here are the key features of this system. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            
            <h3 id="feature-one">Feature One</h3>
            <p>Description of feature one. Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            
            <h3 id="feature-two">Feature Two</h3>
            <p>Description of feature two. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.</p>
            
            <h2 id="configuration">Configuration</h2>
            <p>How to configure the system properly. Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
          </section>

          <section>
            <h1 id="conclusion">Conclusion</h1>
            <p>Final thoughts and summary. Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
          </section>
        </article>
      </TOCLayout>
    </div>
  );
}