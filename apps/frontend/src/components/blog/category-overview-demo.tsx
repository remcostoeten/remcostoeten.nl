'use client';

import React, { useState } from 'react';
import { CategoryOverview } from './category-overview';
import { generateCategoryData } from '@/lib/blog/category-utils';
import { CategoryData, TBlogPost } from '@/lib/blog/types';

interface CategoryOverviewDemoProps {
  posts: TBlogPost[];
  onCategorySelect?: (category: CategoryData) => void;
}

export function CategoryOverviewDemo({ posts, onCategorySelect }: CategoryOverviewDemoProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showPostCount, setShowPostCount] = useState(true);

  const categories = generateCategoryData(posts);

  const handleCategoryClick = (category: CategoryData) => {
    console.log('Category clicked:', category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setLayout('grid')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                layout === 'grid'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-border hover:bg-muted'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                layout === 'list'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-border hover:bg-muted'
              }`}
            >
              List
            </button>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPostCount}
              onChange={(e) => setShowPostCount(e.target.checked)}
              className="rounded"
            />
            Show post counts
          </label>
        </div>

        <div className="text-sm text-muted-foreground">
          {categories.length} categories • {posts.length} total posts
        </div>
      </div>

      {/* Category Overview */}
      <CategoryOverview
        categories={categories}
        layout={layout}
        showPostCount={showPostCount}
        onCategoryClick={handleCategoryClick}
      />
    </div>
  );
}