'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Hash, Folder, Calendar, SortAsc, SortDesc } from "lucide-react";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { BlogPostCard } from "@/components/blog/blog-post-card";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  category: string;
  readTime: number;
}

interface BlogPostsClientProps {
  allPosts: BlogPost[];
}

type SortOption = 'newest' | 'oldest' | 'title' | 'readTime';

export function BlogPostsClient({ allPosts }: BlogPostsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique categories and tags
  const { categories, tags } = useMemo(() => {
    const categories = Array.from(new Set(allPosts.map(post => post.category))).sort();
    const tags = Array.from(new Set(allPosts.flatMap(post => post.tags))).sort();
    return { categories, tags };
  }, [allPosts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = allPosts.filter(post => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query)) ||
          post.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && post.category !== selectedCategory) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => post.tags.includes(tag));
        if (!hasSelectedTag) return false;
      }

      return true;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'readTime':
          return a.readTime - b.readTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allPosts, searchQuery, selectedCategory, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0 || sortBy !== 'newest';

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Search and Filter Controls */}
      <motion.div 
        className="space-y-6"
        {...ANIMATION_CONFIGS.fadeInUp}
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts, tags, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-base"
          />
        </div>

        {/* Filter Toggle and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters 
                  ? 'bg-accent text-accent-foreground border-accent' 
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
              <option value="readTime">Read time</option>
            </select>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-6 border border-border rounded-xl bg-muted/30 space-y-6">
                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Categories</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors font-medium ${
                          selectedCategory === category
                            ? 'bg-accent text-accent-foreground border-accent'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors font-medium ${
                          selectedTags.includes(tag)
                            ? 'bg-accent text-accent-foreground border-accent'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategory && (
              <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded border border-accent/20">
                <Folder className="w-3 h-3" />
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:bg-accent/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
              >
                <Hash className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:bg-secondary/80 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Results Count */}
      <motion.div
        className="flex items-center justify-between text-sm text-muted-foreground py-2"
        {...ANIMATION_CONFIGS.fadeInUp}
      >
        <span className="font-medium">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          {allPosts.length !== filteredPosts.length && ` of ${allPosts.length} total`}
        </span>
      </motion.div>

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        {filteredPosts.length > 0 ? (
          <motion.div
            key="posts-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredPosts.map((post, index) => (
              <BlogPostCard key={post.slug} post={post} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-posts"
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-md mx-auto">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={clearAllFilters}
                className="text-accent hover:underline font-medium"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}