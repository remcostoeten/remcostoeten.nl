"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { blogPosts } from '@/lib/blog-data';

const navigationItems = [
  { label: 'Home', href: '/', isActive: false },
  { label: 'All posts', href: '/posts', isActive: false },
  { label: 'Contact', href: '/contact', isActive: false },
];

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen" style={{ background: '#171616' }}>
        <Navigation navigationItems={navigationItems} />
        <main className="pt-24 px-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to all posts
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      <Navigation navigationItems={navigationItems} />
      
      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/posts"
              className="
                inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                bg-stone-700 hover:bg-stone-600 text-white text-sm font-medium
                transition-all duration-200 hover:scale-105 mb-6
              "
            >
              <ArrowLeft size={14} />
              All posts
            </Link>
            
            <div className="mb-4">
              <time className="text-stone-400 text-sm font-medium">
                {post.date}
              </time>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            
            <p style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7' }}>
              {post.description}
            </p>
          </div>
          
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-stone-700/30 rounded-lg p-8 border border-stone-600/50">
              <p style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7', marginBottom: '24px' }}>
                This is a sample blog post content. In a real application, you would fetch the full content 
                from your CMS or markdown files and render it here.
              </p>
              
              <p style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7', marginBottom: '24px' }}>
                The post content would include rich text, images, code blocks, and other media elements 
                that make up a complete blog article.
              </p>
              
              <p style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7' }}>
                You can extend this template to include features like reading time, tags, related posts, 
                comments, and social sharing buttons.
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}