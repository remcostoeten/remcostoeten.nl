'use client';

import { TBlogPost, TBlogCategory } from './types';

// Client-side blog utilities that work with data fetched from server components

export function filterPostsByCategory(posts: TBlogPost[], category: TBlogCategory): TBlogPost[] {
  return category === 'all' ? posts : posts.filter(post => post.category === category);
}

export function filterPostsByTags(posts: TBlogPost[], tags: string[]): TBlogPost[] {
  if (tags.length === 0) return posts;
  return posts.filter(post => 
    tags.some(tag => post.tags.includes(tag))
  );
}

export function filterPostsByCategoryAndTags(
  posts: TBlogPost[], 
  category: TBlogCategory, 
  tags: string[]
): TBlogPost[] {
  let filtered = filterPostsByCategory(posts, category);
  return filterPostsByTags(filtered, tags);
}

export function searchPosts(posts: TBlogPost[], query: string): TBlogPost[] {
  if (!query.trim()) return posts;
  
  const searchTerm = query.toLowerCase();
  return posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.excerpt.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

export function getCategoryDisplayName(category: TBlogCategory): string {
  const categoryNames: Record<TBlogCategory, string> = {
    'all': 'All Posts',
    'development': 'Development',
    'design': 'Design',
    'best-practices': 'Best Practices'
  };
  return categoryNames[category] || category;
}

export function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getRelatedPostsClient(currentPost: TBlogPost, allPosts: TBlogPost[], limit: number = 3): TBlogPost[] {
  return allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      // Calculate relevance score based on shared tags and category
      let score = 0;
      if (post.category === currentPost.category) score += 2;
      
      const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      score += sharedTags.length;
      
      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}
