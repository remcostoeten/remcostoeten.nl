'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import readingTime from 'reading-time';
import { TBlogPost, TBlogMetadata, TBlogCategory, TEnhancedBlogPost } from './types';
import { parseHeadingsFromMDX } from './toc-utils';
import { generateBlogPostBreadcrumbs } from './breadcrumb-utils';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export async function getAllMdxFiles(): Promise<string[]> {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }
  
  return fs.readdirSync(contentDirectory)
    .filter(filename => filename.endsWith('.mdx'))
    .map(filename => filename.replace(/\.mdx$/, ''));
}

export async function getMdxContent(slug: string): Promise<string> {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return '';
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContent);
  return content;
}

export async function getMdxMetadata(slug: string): Promise<TBlogMetadata | null> {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);
  
  // Validate required fields
  if (!data.title || !data.slug) {
    console.warn(`Invalid MDX metadata for ${slug}: missing title or slug`);
    return null;
  }
  
  // Calculate reading time (simple calculation)
  const content = await getMdxContent(slug);
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  
  // Ensure publishedAt is in ISO format
  let publishedAt = data.publishedAt || new Date().toISOString();
  if (publishedAt && !publishedAt.includes('T')) {
    publishedAt = new Date(publishedAt + 'T00:00:00Z').toISOString();
  }
  
  return {
    title: data.title,
    excerpt: data.excerpt || '',
    publishedAt,
    readTime,
    tags: Array.isArray(data.tags) ? data.tags : [],
    category: (data.category as TBlogCategory) || 'development',
    slug: data.slug || slug,
    status: data.status || 'published',
    author: data.author,
    seo: data.seo ? {
      title: data.seo.title,
      description: data.seo.description,
      keywords: Array.isArray(data.seo.keywords) ? data.seo.keywords : []
    } : undefined
  };
}

export async function getAllMdxPosts(): Promise<TBlogPost[]> {
  const slugs = await getAllMdxFiles();
  const posts: TBlogPost[] = [];
  
  for (const slug of slugs) {
    const metadata = await getMdxMetadata(slug);
    if (!metadata || metadata.status !== 'published') {
      continue;
    }
    
    const content = await getMdxContent(slug);
    if (!content) {
      continue;
    }
    
    posts.push({
      ...metadata,
      content
    });
  }
  
  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getMdxPostBySlug(slug: string): Promise<TBlogPost | null> {
  const metadata = await getMdxMetadata(slug);
  if (!metadata || metadata.status !== 'published') {
    return null;
  }
  
  const content = await getMdxContent(slug);
  if (!content) {
    return null;
  }
  
  return {
    ...metadata,
    content
  };
}

export async function getEnhancedMdxPostBySlug(slug: string): Promise<TEnhancedBlogPost | null> {
  const metadata = await getMdxMetadata(slug);
  if (!metadata || metadata.status !== 'published') {
    return null;
  }
  
  const content = await getMdxContent(slug);
  if (!content) {
    return null;
  }
  
  // Generate TOC from content
  const headings = parseHeadingsFromMDX(content, 3);
  
  // Generate breadcrumbs
  const breadcrumbs = generateBlogPostBreadcrumbs(
    metadata.title,
    metadata.slug,
    metadata.category !== 'all' ? metadata.category : undefined
  );
  
  return {
    ...metadata,
    content,
    headings,
    breadcrumbs,
  };
}

export async function getMdxPostsByCategory(category: TBlogCategory): Promise<TBlogPost[]> {
  const posts = await getAllMdxPosts();
  if (category === 'all') return posts;
  return posts.filter(post => post.category === category);
}

export async function getMdxPostsByTag(tag: string): Promise<TBlogPost[]> {
  const posts = await getAllMdxPosts();
  return posts.filter(post => post.tags.includes(tag));
}

export async function getAllMdxTags(): Promise<string[]> {
  const posts = await getAllMdxPosts();
  const tagSet = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export async function getAllMdxCategories(): Promise<TBlogCategory[]> {
  const posts = await getAllMdxPosts();
  const categorySet = new Set<TBlogCategory>();
  posts.forEach(post => {
    categorySet.add(post.category);
  });
  return Array.from(categorySet).sort();
}

export async function getRelatedMdxPosts(currentPost: TBlogPost, limit: number = 3): Promise<TBlogPost[]> {
  const posts = await getAllMdxPosts();
  return posts
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

export async function getTagData(tag: string): Promise<import('./types').TagData | null> {
  const posts = await getAllMdxPosts();
  const tagPosts = posts.filter(post => post.tags.includes(tag));
  
  if (tagPosts.length === 0) {
    return null;
  }
  
  // Get related tags (tags that appear frequently with this tag)
  const relatedTagsMap = new Map<string, number>();
  tagPosts.forEach(post => {
    post.tags.forEach(postTag => {
      if (postTag !== tag) {
        relatedTagsMap.set(postTag, (relatedTagsMap.get(postTag) || 0) + 1);
      }
    });
  });
  
  const relatedTags = Array.from(relatedTagsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tagName]) => tagName);
  
  return {
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-'),
    postCount: tagPosts.length,
    relatedTags,
  };
}

export async function getCategoryData(category: TBlogCategory): Promise<import('./types').CategoryData | null> {
  if (category === 'all') {
    return null;
  }
  
  const posts = await getMdxPostsByCategory(category);
  
  const categoryDisplayNames: Record<TBlogCategory, string> = {
    'all': 'All',
    'development': 'Development',
    'design': 'Design',
    'best-practices': 'Best Practices',
  };
  
  const categoryColors: Record<TBlogCategory, string> = {
    'all': '#6b7280',
    'development': '#3b82f6',
    'design': '#8b5cf6',
    'best-practices': '#10b981',
  };
  
  const categoryDescriptions: Record<TBlogCategory, string> = {
    'all': 'All blog posts',
    'development': 'Technical articles about software development',
    'design': 'Design principles and user experience',
    'best-practices': 'Industry best practices and methodologies',
  };
  
  return {
    name: categoryDisplayNames[category],
    slug: category,
    description: categoryDescriptions[category],
    color: categoryColors[category],
    postCount: posts.length,
  };
}

export async function getAllTagsWithData(): Promise<import('./types').TagData[]> {
  const tags = await getAllMdxTags();
  const tagDataPromises = tags.map(tag => getTagData(tag));
  const tagDataResults = await Promise.all(tagDataPromises);
  
  return tagDataResults.filter((tagData): tagData is import('./types').TagData => tagData !== null);
}

export async function getAllCategoriesWithData(): Promise<import('./types').CategoryData[]> {
  const categories = await getAllMdxCategories();
  const categoryDataPromises = categories
    .filter(cat => cat !== 'all')
    .map(category => getCategoryData(category));
  const categoryDataResults = await Promise.all(categoryDataPromises);
  
  return categoryDataResults.filter((categoryData): categoryData is import('./types').CategoryData => categoryData !== null);
}