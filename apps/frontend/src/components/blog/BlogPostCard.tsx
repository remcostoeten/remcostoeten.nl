"use client";

import React from 'react';
import { TransitionLink } from '@/components/view-transitions';
import { ArrowRight } from 'lucide-react';
import { BlogPostCardProps } from './types';

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <TransitionLink
      href={`/posts/${post.slug}`}
      className="
        group block p-6 rounded-lg border border-stone-700/50
        hover:border-stone-600 hover:bg-stone-800/30
        transition-all duration-200 hover:scale-[1.01]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-stone-400 text-base mb-4 leading-relaxed group-hover:text-stone-300 transition-colors duration-200">
            {post.description}
          </p>
          <div className="flex items-center gap-3">
            <ArrowRight 
              size={16} 
              className="text-stone-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-200" 
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <time className="text-stone-500 text-sm font-medium group-hover:text-stone-400 transition-colors duration-200">
            {post.date}
          </time>
        </div>
      </div>
    </TransitionLink>
  );
}