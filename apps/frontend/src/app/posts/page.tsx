"use client";

import React, { useState, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { BlogHeader, BlogPostList } from '@/components/blog';
import { NewPosts } from '@/components/new-posts';
import { categories, blogPosts } from '@/lib/blog-data';

const navigationItems = [
  { label: 'Home', href: '/', isActive: false },
  { label: 'All posts', href: '/posts', isActive: true },
  { label: 'Contact', href: '/contact', isActive: false },
];

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return blogPosts;
    return blogPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen" style={{ background: '#171616', viewTransitionName: 'posts-page' }}>
      <Navigation navigationItems={navigationItems} />
      
      <main className="pt-24 px-4" style={{ viewTransitionName: 'main-content' }}>
        <div className="max-w-4xl mx-auto">
          <BlogHeader
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
          
          <div style={{ viewTransitionName: 'blog-content' }}>
            {selectedCategory ? (
              <BlogPostList posts={filteredPosts} />
            ) : (
              <NewPosts posts={blogPosts.slice(0, 6)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}