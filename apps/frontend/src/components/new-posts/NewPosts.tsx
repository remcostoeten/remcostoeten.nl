"use client";

import React, { useEffect, useRef, memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlogPost } from '@/components/blog/types';

interface NewPostsProps {
  posts: BlogPost[];
}

const NewPosts = memo(function NewPosts({ posts }: NewPostsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLDivElement>(null);

  // Memoize the posts slice to prevent unnecessary re-renders
  const displayedPosts = useMemo(() => posts.slice(0, 6), [posts]);

  // Optimize event handlers with useCallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const cursorLabel = cursorLabelRef.current;
    if (!cursorLabel) return;
    
    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      cursorLabel.style.transform = `translate3d(${e.clientX + 15}px, ${e.clientY - 25}px, 0)`;
    });
  }, []);

  const handlePostEnter = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const postCard = target.closest('.post-card');
    const cursorLabel = cursorLabelRef.current;
    
    if (postCard && cursorLabel) {
      cursorLabel.style.opacity = '1';
      postCard.classList.add('card-hovering');
    }
  }, []);

  const handlePostLeave = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const postCard = target.closest('.post-card');
    const cursorLabel = cursorLabelRef.current;
    
    if (postCard && cursorLabel) {
      cursorLabel.style.opacity = '0';
      postCard.classList.remove('card-hovering');
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Use event delegation for better performance
    section.addEventListener('mouseenter', handlePostEnter, { passive: true });
    section.addEventListener('mouseleave', handlePostLeave, { passive: true });
    section.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      section.removeEventListener('mouseenter', handlePostEnter);
      section.removeEventListener('mouseleave', handlePostLeave);
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, handlePostEnter, handlePostLeave]);

  return (
    <section className="py-12 pb-16 max-w-[680px] w-full relative" ref={sectionRef}>
      {/* Cursor Following Label */}
      <div 
        ref={cursorLabelRef}
        className="fixed pointer-events-none z-50 opacity-0 transition-opacity duration-200 ease-out"
        style={{
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '6px 12px',
          borderRadius: '6px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        Read now
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white mb-0">New posts</h2>
        </div>
        <Link
          href="/posts"
          className="flex items-center gap-[5px] hover:opacity-80 transition-opacity duration-200"
        >
          <span style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.2' }}>All posts</span>
          <ArrowRight size={16} style={{ color: '#aba9a7' }} />
        </Link>
      </div>

      {/* Posts List */}
      <div className="flex flex-col gap-0">
        {displayedPosts.map((post, index) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="post-card block w-full group transition-all duration-300 ease-out hover:bg-stone-800/5"
            style={{
              cursor: 'none', // Hide default cursor when hovering over cards
            }}
          >
            <div className="relative border-b border-stone-700/30" style={{ minHeight: '90px' }}>
              {/* Arrow Element - absolute positioned */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-2 flex-shrink-0">
                <svg
                  viewBox="0 0 256 256"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full fill-white"
                >
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                </svg>
              </div>

              {/* Content Area with 90px Padding */}
              <div 
                className="flex items-center justify-between py-[45px] transition-all duration-300 ease-out"
              >
                {/* Left Content */}
                <div className="flex-1 flex flex-col gap-[2px] transition-all duration-300 ease-out group-hover:pl-10">
                  {/* Title */}
                  <h3 style={{ 
                    fontSize: '16px', 
                    color: 'white', 
                    lineHeight: '1.2',
                    margin: 0,
                    fontWeight: 'normal',
                    transition: 'color 0.3s ease-out'
                  }}>
                    {post.title}
                  </h3>

                  {/* Subtitle */}
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#aba9a7', 
                    lineHeight: '1.2',
                    margin: 0,
                    fontWeight: 'normal',
                    transition: 'color 0.3s ease-out'
                  }}>
                    {post.description}
                  </p>
                </div>

                {/* Date */}
                <div className="flex-shrink-0 pr-0">
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#aba9a7', 
                    lineHeight: '1.2',
                    margin: 0,
                    fontWeight: 'normal',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease-out'
                  }}>
                    {post.date}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        /* Enhanced hover effects */
        .post-card:hover h3 {
          color: #fb923c !important;
        }
        
        .post-card:hover p {
          color: #d6d3d1 !important;
        }

        /* Custom cursor hiding when needed */
        .post-card:hover {
          cursor: none;
        }

        /* Smooth transitions for all interactive elements */
        .post-card * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
});

export { NewPosts };