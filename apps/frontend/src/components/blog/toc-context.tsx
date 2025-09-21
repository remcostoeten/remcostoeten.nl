'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {  TOCContextValue } from '@/lib/blog/types';
import { TOCItem } from '@/lib/blog/toc-utils';

const TOCContext = createContext<TOCContextValue | null>(null);

interface TOCProviderProps {
  children: React.ReactNode;
  items: TOCItem[];
  rootMargin?: string;
  threshold?: number;
}

export function TOCProvider({ 
  children, 
  items, 
  rootMargin = '-80px 0px -80px 0px',
  threshold = 0.1 
}: TOCProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Update active ID immediately for better UX
      setActiveId(id);
    }
  }, []);

  useEffect(() => {
    // Get all heading IDs from the TOC items (flattened)
    const getAllIds = (tocItems: TOCItem[]): string[] => {
      const ids: string[] = [];
      
      const traverse = (items: TOCItem[]) => {
        items.forEach(item => {
          ids.push(item.id);
          if (item.children) {
            traverse(item.children);
          }
        });
      };
      
      traverse(tocItems);
      return ids;
    };

    const headingIds = getAllIds(items);
    
    if (headingIds.length === 0) return;

    const headingElements = headingIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the heading that's most visible
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio and position to find the most prominent heading
          const mostVisible = visibleEntries.reduce((prev, current) => {
            // Prefer headings that are higher up on the page when multiple are visible
            const prevTop = prev.boundingClientRect.top;
            const currentTop = current.boundingClientRect.top;
            
            // If both are above the viewport center, prefer the one closer to the top
            if (prevTop >= 0 && currentTop >= 0) {
              return prevTop < currentTop ? prev : current;
            }
            
            // If one is above and one below, prefer the one above
            if (prevTop >= 0 && currentTop < 0) return prev;
            if (currentTop >= 0 && prevTop < 0) return current;
            
            // If both are below, prefer the one with higher intersection ratio
            return prev.intersectionRatio > current.intersectionRatio ? prev : current;
          });
          
          setActiveId(mostVisible.target.id);
        } else {
          // If no headings are visible, find the closest one above the viewport
          const elementsAbove = headingElements.filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight / 2;
          });
          
          if (elementsAbove.length > 0) {
            // Get the last (lowest) heading that's above the viewport center
            const closestAbove = elementsAbove[elementsAbove.length - 1];
            setActiveId(closestAbove.id);
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    headingElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      headingElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [items, rootMargin, threshold]);

  const contextValue: TOCContextValue = {
    activeId,
    items,
    scrollToHeading
  };

  return (
    <TOCContext.Provider value={contextValue}>
      {children}
    </TOCContext.Provider>
  );
}

export function useTOC() {
  const context = useContext(TOCContext);
  if (!context) {
    throw new Error('useTOC must be used within a TOCProvider');
  }
  return context;
}