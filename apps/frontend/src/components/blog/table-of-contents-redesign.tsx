'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {  TableOfContentsProps } from '@/lib/blog/types';
import { useTOC } from './toc-context';
import { ChevronRight, List } from 'lucide-react';
import { TOCItem } from '@/lib/blog/toc-utils';


type Props = {
item: TOCItem;
  activeId: string | null;
  onItemClick: (id: string) => void;
  level?: number;
}

function TOCItemComponent({ item, activeId, onItemClick, level = 0 }: Props) {
  const isActive = activeId === item.id;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="list-none">
      <button
        onClick={() => onItemClick(item.id)}
        className={cn(
          "group w-full text-left py-1.5 px-0 transition-all duration-200",
          "hover:text-accent focus:outline-none focus:text-accent",
          "border-l-2 border-transparent hover:border-accent/30",
          level === 0 && "pl-0",
          level === 1 && "pl-4 border-l border-border/30",
          level >= 2 && "pl-8 border-l border-border/20",
          isActive && "text-accent border-l-accent font-medium"
        )}
      >
        <div className="flex items-start gap-2">
          {level === 0 && (
            <div className={cn(
              "w-1.5 h-1.5 rounded-full mt-2 transition-colors",
              isActive ? "bg-accent" : "bg-muted-foreground/40"
            )} />
          )}
          <span className={cn(
            "text-sm leading-relaxed transition-colors",
            level === 0 && "font-medium text-foreground",
            level === 1 && "text-muted-foreground text-sm",
            level >= 2 && "text-muted-foreground/80 text-xs",
            isActive && "text-accent"
          )}>
            {item.text}
          </span>
        </div>
      </button>
      
      {hasChildren && (
        <ul className="mt-1 space-y-0.5">
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

export function TableOfContentsRedesign({ className, ...props }: TableOfContentsProps) {
  const { items, activeId, scrollToHeading } = useTOC();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      className={cn("space-y-4", className)}
      aria-label="Table of contents"
      {...props}
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <List className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Contents</h3>
      </div>
      
      {/* TOC Items */}
      <div className="space-y-1">
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
      </div>
    </nav>
  );
}

// Mobile TOC component with improved design
interface MobileTOCRedesignProps extends TableOfContentsProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileTOCRedesign({ isOpen, onToggle, className, ...props }: MobileTOCRedesignProps) {
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
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-lg border",
          "bg-muted/30 hover:bg-muted/50 transition-colors",
          "text-sm font-medium text-foreground"
        )}
        aria-expanded={isOpen}
        aria-controls="mobile-toc"
      >
        <div className="flex items-center gap-2">
          <List className="w-4 h-4" />
          <span>Table of Contents</span>
        </div>
        <ChevronRight 
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )} 
        />
      </button>

      {isOpen && (
        <div 
          id="mobile-toc"
          className="mt-3 p-4 rounded-lg border bg-card/50 backdrop-blur-sm"
        >
          <div className="max-h-80 overflow-y-auto">
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
          </div>
        </div>
      )}
    </div>
  );
}