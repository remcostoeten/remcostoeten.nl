"use client";

import React from 'react';
import { BlogPostCard } from './BlogPostCard';
import { BlogPostListProps } from './types';

export function BlogPostList({ posts }: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 text-lg">No posts found in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id}>
          <BlogPostCard post={post} />
        </div>
      ))}
    </div>
  );
}