"use client";

import React, { useState, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { BlogHeader, BlogPostList } from '@/components/blog';
import { NewPosts } from '@/components/new-posts';
import { PageTracker } from '@/components/analytics';
import { categories, blogPosts } from '@/lib/blog-data';

const navigationItems = [
  { label: 'Home', href: '/', isActive: false },
  { label: 'All posts', href: '/posts', isActive: true },
  { label: 'Analytics', href: '/analytics', isActive: false },
  { label: 'Contact', href: '/contact', isActive: false },
];

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previousCategory, setPreviousCategory] = useState<string | null>(null);
  const [transitionType, setTransitionType] = useState<'initial' | 'to-topic' | 'to-topics' | 'topic-to-topic'>('initial');

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return blogPosts;
    return blogPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (newCategory: string | null) => {
    const prev = selectedCategory;
    
    // Determine transition type
    if (prev === null && newCategory !== null) {
      setTransitionType('to-topic');
    } else if (prev !== null && newCategory === null) {
      setTransitionType('to-topics');
    } else if (prev !== null && newCategory !== null && prev !== newCategory) {
      setTransitionType('topic-to-topic');
    }
    
    setPreviousCategory(selectedCategory);
    setSelectedCategory(newCategory);
  };

  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      <PageTracker customTitle="All Posts - Blog" />
      <Navigation navigationItems={navigationItems} />
      
      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <BlogHeader
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
          
          <div>
            {selectedCategory ? (
              <div 
                key={selectedCategory}
                className={
                  transitionType === 'topic-to-topic'
                    ? ""
                    : "animate-in fade-in slide-in-from-right-4 duration-300"
                }
              >
                <BlogPostList posts={filteredPosts} />
              </div>
            ) : (
              <div 
                key="all-posts"
                className="animate-in fade-in slide-in-from-left-4 duration-300"
              >
                <NewPosts posts={blogPosts.slice(0, 6)} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}