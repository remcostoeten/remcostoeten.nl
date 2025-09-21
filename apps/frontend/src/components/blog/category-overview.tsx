'use client';

import React from "react";
import { motion } from "framer-motion";
import { Folder, FileText, ArrowRight, Hash } from "lucide-react";
import { CategoryData } from "@/lib/blog/types";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface CategoryOverviewProps {
  categories: CategoryData[];
  layout?: 'grid' | 'list';
  showPostCount?: boolean;
  onCategoryClick?: (category: CategoryData) => void;
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'all': <Hash className="w-5 h-5" />,
  'development': <FileText className="w-5 h-5" />,
  'design': <Folder className="w-5 h-5" />,
  'best-practices': <ArrowRight className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  'all': 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40',
  'development': 'from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40',
  'design': 'from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40',
  'best-practices': 'from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:border-orange-500/40',
};

export function CategoryOverview({ 
  categories, 
  layout = 'grid', 
  showPostCount = true,
  onCategoryClick,
  className = ''
}: CategoryOverviewProps) {
  const handleCategoryClick = (category: CategoryData) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, category: CategoryData) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryClick(category);
    }
  };

  if (layout === 'list') {
    return (
      <motion.div 
        className={`space-y-3 ${className}`}
        {...ANIMATION_CONFIGS.staggered(0.1)}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.slug}
            className={`
              group relative overflow-hidden rounded-xl border bg-gradient-to-r p-4
              transition-all duration-300 cursor-pointer
              hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1
              focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2
              ${categoryColors[category.slug] || categoryColors['all']}
            `}
            onClick={() => handleCategoryClick(category)}
            onKeyDown={(e) => handleKeyDown(e, category)}
            tabIndex={0}
            role="button"
            aria-label={`View ${category.name} posts`}
            {...ANIMATION_CONFIGS.staggered(index * 0.05)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-background/50 border border-border/50">
                  {category.icon ? (
                    <div dangerouslySetInnerHTML={{ __html: category.icon }} />
                  ) : (
                    categoryIcons[category.slug] || categoryIcons['all']
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {showPostCount && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {category.postCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.postCount === 1 ? 'post' : 'posts'}
                    </div>
                  </div>
                )}
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`
        grid gap-6
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        ${className}
      `}
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      {categories.map((category, index) => (
        <motion.div
          key={category.slug}
          className={`
            group relative overflow-hidden rounded-xl border bg-gradient-to-br p-6
            transition-all duration-300 cursor-pointer
            hover:shadow-xl hover:shadow-black/10 hover:-translate-y-2
            focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2
            ${categoryColors[category.slug] || categoryColors['all']}
          `}
          onClick={() => handleCategoryClick(category)}
          onKeyDown={(e) => handleKeyDown(e, category)}
          tabIndex={0}
          role="button"
          aria-label={`View ${category.name} posts`}
          {...ANIMATION_CONFIGS.staggered(index * 0.1)}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-5 transform translate-x-6 -translate-y-6">
            {category.icon ? (
              <div dangerouslySetInnerHTML={{ __html: category.icon }} />
            ) : (
              categoryIcons[category.slug] || categoryIcons['all']
            )}
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-background/50 border border-border/50 group-hover:bg-background/70 transition-colors">
                {category.icon ? (
                  <div dangerouslySetInnerHTML={{ __html: category.icon }} />
                ) : (
                  categoryIcons[category.slug] || categoryIcons['all']
                )}
              </div>
              {showPostCount && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                    {category.postCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.postCount === 1 ? 'post' : 'posts'}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {category.description}
              </p>
            </div>

            {/* Hover indicator */}
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground group-hover:text-accent transition-colors">
              <span>Explore posts</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}