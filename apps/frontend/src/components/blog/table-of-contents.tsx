'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TOCItem, TableOfContentsProps } from '@/lib/blog/types';
import { useTOC } from './toc-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface TOCItemComponentProps {
  item: TOCItem;
  activeId: string | null;
  onItemClick: (id: string) => void;
  level?: number;
}

function TOCItemComponent({ item, activeId, onItemClick, level = 0 }: TOCItemComponentProps) {
  const isActive = activeId === item.id;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className={cn("list-none", level > 0 && "ml-4")}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onItemClick(item.id)}
        className={cn(
          "w-full justify-start text-left h-auto py-1 px-2 font-normal text-sm",
          "hover:bg-muted/50 transition-colors",
          isActive && "bg-accent text-accent-foreground font-medium",
          level === 0 && "font-medium",
          level === 1 && "text-sm text-muted-foreground",
          level >= 2 && "text-xs text-muted-foreground"
        )}
      >
        <span className="truncate">{item.text}</span>
      </Button>
      
      {hasChildren && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <TOCItemComponent
              key={child.id}
              item={child}
              activeId={activeId}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TableOfContents({ className, ...props }: TableOfContentsProps) {
  const { items, activeId, scrollToHeading } = useTOC();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      className={cn("space-y-2", className)}
      aria-label="Table of contents"
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-accent rounded-full" />
        <h3 className="font-semibold text-sm text-foreground">On this page</h3>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <ul className="space-y-1">
          {items.map((item) => (
            <TOCItemComponent
              key={item.id}
              item={item}
              activeId={activeId}
              onItemClick={scrollToHeading}
            />
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
}

// Mobile TOC component with collapsible design
interface MobileTOCProps extends TableOfContentsProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileTOC({ isOpen, onToggle, className, ...props }: MobileTOCProps) {
  const { items, activeId, scrollToHeading } = useTOC();

  if (!items || items.length === 0) {
    return null;
  }

  const handleItemClick = (id: string) => {
    scrollToHeading(id);
    onToggle(); // Close mobile TOC after navigation
  };

  return (
    <div className={cn("lg:hidden", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="w-full justify-between mb-4"
        aria-expanded={isOpen}
        aria-controls="mobile-toc"
      >
        <span className="flex items-center gap-2">
          <div className="w-1 h-4 bg-accent rounded-full" />
          Table of Contents
        </span>
        <svg
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div 
          id="mobile-toc"
          className="border rounded-lg p-4 bg-card"
        >
          <ScrollArea className="max-h-80">
            <ul className="space-y-1">
              {items.map((item) => (
                <TOCItemComponent
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  onItemClick={handleItemClick}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}