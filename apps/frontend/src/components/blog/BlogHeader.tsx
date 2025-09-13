"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BlogHeaderProps } from './types';

export function BlogHeader({ selectedCategory, onCategoryChange, categories }: BlogHeaderProps) {
  const selectedCategoryData = categories.find(cat => cat.slug === selectedCategory);
  
  // Check if this is a topic-to-topic transition by looking at the key change pattern
  const isTopicToTopic = selectedCategory && selectedCategoryData;

  return (
    <div className="mb-12">
      {/* Header Section */}
      <div className="mb-8">
        {selectedCategory ? (
          // Category View Header
          <div key={selectedCategory} className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onCategoryChange(null)}
              className="
                flex items-center gap-2 px-3 py-1.5 rounded-lg
                bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium
                transition-all duration-200 hover:scale-105
              "
            >
              <ArrowLeft size={14} />
              All writing
            </button>
            <h1 className="text-3xl font-semibold text-white">
              {selectedCategoryData?.name || selectedCategory}
            </h1>
          </div>
        ) : (
          // All Posts View Header
          <h1 key="topics" className="text-3xl font-semibold text-white mb-2 animate-in fade-in slide-in-from-left-4 duration-300">
            Topics
          </h1>
        )}
      </div>

      {/* Categories Navigation */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(isActive ? null : category.slug)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 ease-out hover:scale-105 active:scale-95
                ${isActive 
                  ? 'bg-white text-stone-800' 
                  : 'bg-transparent text-stone-300 hover:text-white hover:bg-stone-700/50'
                }
              `}
            >
              <ArrowRight 
                size={14} 
                className={`transition-transform duration-200 ease-out ${
                  isActive ? 'rotate-90' : ''
                }`} 
              />
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}