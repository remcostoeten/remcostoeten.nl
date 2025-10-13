// 'use client';

// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import {  TOCContextValue } from '@/lib/blog/types';
// import { TOCItem } from '@/lib/blog/toc-utils';

// const TOCContext = createContext<TOCContextValue | null>(null);

// interface TOCProviderProps {
//   children: React.ReactNode;
//   items: TOCItem[];
//   rootMargin?: string;
//   threshold?: number;
// }

// export function TOCProvider({ 
//   children, 
//   items, 
//   rootMargin = '-80px 0px -80px 0px',
//   threshold = 0.1 
// }: TOCProviderProps) {
//   const [activeId, setActiveId] = useState<string | null>(null);

//   const scrollToHeading = useCallback((id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       const offset = 80; // Account for fixed header
//       const elementPosition = element.offsetTop - offset;

//       window.scrollTo({
//         top: elementPosition,
//         behavior: 'smooth'
//       });

//       // Update active ID immediately for better UX
//       setActiveId(id);
//     }
//   }, []);

//   useEffect(() => {
//     // Get all heading IDs from the TOC items (flattened)
//     const getAllIds = (tocItems: TOCItem[]): string[] => {
//       const ids: string[] = [];

//       const traverse = (items: TOCItem[]) => {
//         items.forEach(item => {
//           ids.push(item.id);
//           if (item.children) {
//             traverse(item.children);
//           }
//         });
//       };

//       traverse(tocItems);
//       return ids;
//     };

//     const headingIds = getAllIds(items);

//     if (headingIds.length === 0) return;

//     const headingElements = headingIds
//       .map(id => document.getElementById(id))
//       .filter(Boolean) as HTMLElement[];

//     if (headingElements.length === 0) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         // Find the heading that's most visible
//         const visibleEntries = entries.filter(entry => entry.isIntersecting);

//         if (visibleEntries.length > 0) {
//           // Sort by intersection ratio and position to find the most prominent heading
//           const mostVisible = visibleEntries.reduce((prev, current) => {
//             // Prefer headings that are higher up on the page when multiple are visible
//             const prevTop = prev.boundingClientRect.top;
//             const currentTop = current.boundingClientRect.top;

//             // If both are above the viewport center, prefer the one closer to the top
//             if (prevTop >= 0 && currentTop >= 0) {
//               return prevTop < currentTop ? prev : current;
//             }

//             // If one is above and one below, prefer the one above
//             if (prevTop >= 0 && currentTop < 0) return prev;
//             if (currentTop >= 0 && prevTop < 0) return current;

//             // If both are below, prefer the one with higher intersection ratio
//             return prev.intersectionRatio > current.intersectionRatio ? prev : current;
//           });

//           setActiveId(mostVisible.target.id);
//         } else {
//           // If no headings are visible, find the closest one above the viewport
//           const elementsAbove = headingElements.filter(el => {
//             const rect = el.getBoundingClientRect();
//             return rect.top < window.innerHeight / 2;
//           });

//           if (elementsAbove.length > 0) {
//             // Get the last (lowest) heading that's above the viewport center
//             const closestAbove = elementsAbove[elementsAbove.length - 1];
//             setActiveId(closestAbove.id);
//           }
//         }
//       },
//       {
//         rootMargin,
//         threshold
//       }
//     );

//     headingElements.forEach(element => {
//       observer.observe(element);
//     });

//     return () => {
//       headingElements.forEach(element => {
//         observer.unobserve(element);
//       });
//     };
//   }, [items, rootMargin, threshold]);

//   const contextValue: TOCContextValue = {
//     activeId,
//     items,
//     scrollToHeading
//   };

//   return (
//     <TOCContext.Provider value={contextValue}>
//       {children}
//     </TOCContext.Provider>
//   );
// }

// export function useTOC() {
//   const context = useContext(TOCContext);
//   if (!context) {
//     throw new Error('useTOC must be used within a TOCProvider');
//   }
//   return context;
// }

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { TOCItem } from "@/lib/blog/toc-utils"

interface TOCContextValue {
  items: TOCItem[]
  activeId: string | null
  scrollToHeading: (id: string) => void
}

const TOCContext = createContext<TOCContextValue | undefined>(undefined)

export function TOCProvider({ children, items }: { children: ReactNode; items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    // Get all heading elements from the TOC items
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

    // Function to get heading elements
    const getHeadingElements = (): HTMLElement[] => {
      return headingIds
        .map(id => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];
    };

    let observer: IntersectionObserver | null = null;
    let scrollTimeout: NodeJS.Timeout;
    let retryTimeout: NodeJS.Timeout;

    const initializeObserver = (headingElements: HTMLElement[]) => {
      // Enhanced intersection observer for better active section detection
      observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter(entry => entry.isIntersecting);

          if (visibleEntries.length > 0) {
            // Find the most prominent heading
            const mostVisible = visibleEntries.reduce((prev, current) => {
              const prevRect = prev.boundingClientRect;
              const currentRect = current.boundingClientRect;
              const viewportCenter = window.innerHeight / 2;

              // Prefer headings closer to the top of the viewport
              const prevDistance = Math.abs(prevRect.top - viewportCenter);
              const currentDistance = Math.abs(currentRect.top - viewportCenter);

              // If distances are similar, prefer the one with higher intersection ratio
              if (Math.abs(prevDistance - currentDistance) < 50) {
                return prev.intersectionRatio > current.intersectionRatio ? prev : current;
              }

              return prevDistance < currentDistance ? prev : current;
            });

            setActiveId(mostVisible.target.id);
          } else {
            // If no headings are visible, find the closest one above the viewport
            const elementsAbove = headingElements.filter(el => {
              const rect = el.getBoundingClientRect();
              return rect.top < window.innerHeight * 0.3; // Top 30% of viewport
            });

            if (elementsAbove.length > 0) {
              // Get the last (lowest) heading that's above the threshold
              const closestAbove = elementsAbove[elementsAbove.length - 1];
              setActiveId(closestAbove.id);
            }
          }
        },
        {
          rootMargin: '-20% 0px -60% 0px', // More precise viewport detection
          threshold: [0, 0.1, 0.5, 1.0] // Multiple thresholds for better detection
        }
      );

      // Observe all heading elements
      headingElements.forEach(element => {
        observer!.observe(element);
      });
    };

    const initializeScrollHandler = (headingElements: HTMLElement[]) => {
      // Fallback scroll handler for edge cases
      const handleScroll = () => {
        const scrollPosition = window.scrollY + window.innerHeight * 0.3;

        for (let i = headingElements.length - 1; i >= 0; i--) {
          const element = headingElements[i];
          const rect = element.getBoundingClientRect();
          const absoluteTop = rect.top + window.scrollY;

          if (absoluteTop <= scrollPosition) {
            setActiveId(element.id);
            break;
          }
        }
      };

      // Throttled scroll handler as fallback
      const throttledScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 100);
      };

      window.addEventListener('scroll', throttledScroll, { passive: true });
      handleScroll(); // Initial check
    };

    // Try to initialize immediately
    let headingElements = getHeadingElements();

    if (headingElements.length > 0) {
      initializeObserver(headingElements);
      initializeScrollHandler(headingElements);
    } else {
      // If no elements found initially, wait a bit and retry
      retryTimeout = setTimeout(() => {
        headingElements = getHeadingElements();
        if (headingElements.length > 0) {
          initializeObserver(headingElements);
          initializeScrollHandler(headingElements);
        }
      }, 100);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('scroll', () => clearTimeout(scrollTimeout));
      clearTimeout(scrollTimeout);
      clearTimeout(retryTimeout);
    };
  }, [items])

  // Handle initial hash navigation on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.slice(1); // Remove # from hash
    if (hash) {
      // Wait a bit for content to load, then scroll to the hash
      const scrollToHash = () => {
        const element = document.getElementById(hash)
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top + window.scrollY
          const offsetPosition = elementPosition - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          })

          setActiveId(hash)
        }
      };

      // Try multiple times with increasing delays for content that takes longer to load
      setTimeout(scrollToHash, 100);
      setTimeout(scrollToHash, 300);
      setTimeout(scrollToHash, 600);
    }
  }, []) // Only run once on mount

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })

      setActiveId(id)

      // Update URL hash without triggering page jump
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#${id}`)
      }
    } else {
      // If element not found, try to wait for DOM to be ready and retry
      const retryScroll = () => {
        const retryElement = document.getElementById(id)
        if (retryElement) {
          const offset = 80
          const elementPosition = retryElement.getBoundingClientRect().top + window.scrollY
          const offsetPosition = elementPosition - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          })

          setActiveId(id)

          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', `#${id}`)
          }
        }
      }

      // Wait for next tick and retry
      setTimeout(retryScroll, 100)
    }
  }

  return <TOCContext.Provider value={{ items, activeId, scrollToHeading }}>{children}</TOCContext.Provider>
}

export function useTOC() {
  const context = useContext(TOCContext)
  if (context === undefined) {
    throw new Error("useTOC must be used within a TOCProvider")
  }
  return context
}
