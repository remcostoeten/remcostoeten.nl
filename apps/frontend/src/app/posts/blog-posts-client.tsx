'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Hash, Folder, Calendar, SortAsc, SortDesc, SlidersHorizontal } from "lucide-react";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { formatBlogDateShort } from "@/lib/blog/date-utils";
import { useMultipleViewCounts } from "@/hooks/use-multiple-view-counts";

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

  // Get view counts for all posts
  const allSlugs = useMemo(() => allPosts.map(post => post.slug), [allPosts]);
  const { viewCounts, loading: viewCountsLoading, totalViews, totalUniqueViews } = useMultipleViewCounts(allSlugs, {
    autoRefresh: true,
    refreshInterval: 60000 // Refresh every minute
  });

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
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Mobile Hero Section - Featured Post First */}
      {filteredPosts.length > 0 && (
        <motion.div
          className="block sm:hidden"
          {...ANIMATION_CONFIGS.fadeInUp}
        >
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 -mx-5 px-5 py-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-12 h-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                aria-label="Search posts"
                role="searchbox"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-md border border-border bg-background/50 hover:bg-muted transition-colors flex items-center justify-center"
                aria-label="Open filters"
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="w-3 h-3" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Hero Featured Post */}
          <div className="relative">
            <div className="text-sm font-medium text-accent mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-accent rounded-full"></div>
              Latest Article
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
              <BlogPostCard
                post={filteredPosts[0]}
                index={0}
                variant="hero"
                viewCount={viewCounts[filteredPosts[0].slug]?.totalViews || 0}
                showExcerpt={false}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Desktop Search and Filter Controls */}
      <motion.div
        className="hidden sm:block space-y-6"
        {...ANIMATION_CONFIGS.fadeInUp}
      >
        {/* Search and Controls Row */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-9 border border-border rounded-lg bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-sm"
              aria-label="Search posts"
              role="searchbox"
            />
          </div>

          {/* Filter Toggle - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background/50 hover:bg-muted transition-colors relative touch-manipulation"
            aria-label="Open filters"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full transform translate-x-1/2 -translate-y-1/2" />
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-auto h-9 pl-3 pr-8 border border-border rounded-lg bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all appearance-none touch-manipulation"
            aria-label="Sort posts by"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A-Z</option>
            <option value="readTime">Time</option>
          </select>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
              className={`flex items-center gap-2 h-9 px-3 rounded-lg border transition-colors ${showFilters
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-background/50 border-border hover:bg-muted'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent rounded-full" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                aria-label="Clear all filters"
                className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium bg-background/50"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Desktop Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden hidden md:block"
            >
              <div className="p-4 sm:p-6 border border-border rounded-lg bg-muted/10 space-y-4 sm:space-y-6">
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
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors font-medium ${selectedCategory === category
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background/50 border-border hover:bg-muted'
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
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors font-medium ${selectedTags.includes(tag)
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background/50 border-border hover:bg-muted'
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
            className="hidden md:flex flex-wrap gap-2 items-center py-2"
          >
            <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
            {selectedCategory && (
              <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                <Folder className="w-3 h-3" />
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
              >
                <Hash className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Stats Section - Hidden on mobile, shown on desktop */}
      <motion.div
        className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-6 py-8"
        {...ANIMATION_CONFIGS.fadeInUp}
      >
        <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="text-2xl font-bold text-foreground">{allPosts.length}</div>
          <div className="text-sm text-muted-foreground">Total Posts</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="text-2xl font-bold text-foreground">
            {viewCountsLoading ? '...' : totalViews.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Views</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="text-2xl font-bold text-foreground">{categories.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="text-2xl font-bold text-foreground">
            {Math.round(allPosts.reduce((acc, post) => acc + post.readTime, 0) / allPosts.length) || 0}
          </div>
          <div className="text-sm text-muted-foreground">Avg Read</div>
        </div>
      </motion.div>

      {/* Results Count - Mobile optimized */}
      <motion.div
        className="flex items-center justify-between text-sm text-muted-foreground py-4"
        {...ANIMATION_CONFIGS.fadeInUp}
      >
        <span className="font-medium">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          {allPosts.length !== filteredPosts.length && ` of ${allPosts.length} total`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-accent hover:underline font-medium text-xs"
          >
            Clear filters
          </button>
        )}
      </motion.div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      >
        <div className="space-y-6 py-2">
          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Folder className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Categories</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category ? '' : category);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors font-medium ${selectedCategory === category
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-background/50 border-border hover:bg-muted'
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
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    toggleTag(tag);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors font-medium ${selectedTags.includes(tag)
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-background/50 border-border hover:bg-muted'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Active Filters */}
          {hasActiveFilters && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Active Filters</span>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setShowFilters(false);
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                    <Folder className="w-3 h-3" />
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-1 hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-1 hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </FilterDrawer>

      {/* Posts Grid - Desktop Magazine Style Layout */}
      <AnimatePresence mode="wait">
        {filteredPosts.length > 0 ? (
          <motion.div
            key="posts-grid"
            className="space-y-12"
            role="list"
            aria-label="Blog posts grid"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Desktop Featured Post - First post gets special treatment */}
            {filteredPosts.length > 0 && (
              <motion.div
                className="hidden sm:block relative"
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm font-medium text-accent mb-6 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full"></div>
                  Featured Post
                </div>
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div className="order-2 lg:order-1">
                    <BlogPostCard
                      post={filteredPosts[0]}
                      index={0}
                      variant="featured"
                      viewCount={viewCounts[filteredPosts[0].slug]?.totalViews || 0}
                      showExcerpt={false}
                    />
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="aspect-[4/3] bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Calendar className="w-8 h-8 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-accent">Latest Article</p>
                          <p className="text-xs text-muted-foreground">
                            Published {formatBlogDateShort(filteredPosts[0].publishedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Regular Posts Grid - Mobile shows all posts, Desktop shows remaining */}
            <div className="space-y-10">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-4 bg-muted-foreground/30 rounded-full"></div>
                {filteredPosts.length === 1 ? 'All Posts' : 'More Posts'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
                {filteredPosts.map((post, index) => (
                  <BlogPostCard
                    key={post.slug}
                    post={post}
                    index={index}
                    variant={index === 0 ? "featured" : "default"}
                    viewCount={viewCounts[post.slug]?.totalViews || 0}
                    showExcerpt={false}
                  />
                ))}
              </div>
            </div>
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