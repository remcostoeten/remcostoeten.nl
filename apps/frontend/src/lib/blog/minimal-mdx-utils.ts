'use server';

import fs from 'fs';
import path from 'path';
import { TBlogPost, TBlogMetadata, TBlogCategory } from './types';

const contentDirectory = path.join(process.cwd(), 'content/blog');

// Minimal frontmatter parser without external dependencies
function parseFrontmatter(content: string): { data: any; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content };
  }
  
  const frontmatterContent = match[1];
  const markdownContent = match[2];
  
  // Simple YAML-like parser for basic frontmatter
  const data: any = {};
  const lines = frontmatterContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmed.substring(0, colonIndex).trim();
    let value = trimmed.substring(colonIndex + 1).trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      data[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
    } else {
      data[key] = value;
    }
  }
  
  return { data, content: markdownContent };
}

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
  const { content } = parseFrontmatter(fileContent);
  return content;
}

export async function getMdxMetadata(slug: string): Promise<TBlogMetadata | null> {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = parseFrontmatter(fileContent);

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
    category: data.category || 'all',
    slug: data.slug,
    status: data.status || 'published',
    author: data.author || 'Remco Stoeten',
    seo: data.seo ? {
      title: data.seo.title || data.title,
      description: data.seo.description || data.excerpt,
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
