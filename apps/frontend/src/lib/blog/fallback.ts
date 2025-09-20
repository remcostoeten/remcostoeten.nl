'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { TBlogPost, TBlogCategory } from './types';

const contentDirectory = path.join(process.cwd(), 'content/blog');

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

function getReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.ceil(stats.minutes);
}

export async function getAllPostsFallback(): Promise<TBlogPost[]> {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(contentDirectory);
  const posts = filenames
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((filename) => {
      const slug = getSlugFromFilename(filename);
      const filePath = path.join(contentDirectory, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Convert date to ISO format if it's not already
      let publishedAt = data.publishedAt || new Date().toISOString();
      if (publishedAt && !publishedAt.includes('T')) {
        publishedAt = new Date(publishedAt + 'T00:00:00Z').toISOString();
      }

      return {
        title: data.title || 'Untitled',
        excerpt: data.excerpt || '',
        publishedAt,
        readTime: getReadingTime(content),
        tags: data.tags || [],
        category: data.category || 'development',
        slug,
        status: data.status || 'published',
        author: data.author,
        seo: data.seo,
        content,
        // No analytics data in fallback mode
        views: undefined,
      };
    })
    .filter((post) => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return posts;
}

export async function getPostBySlugFallback(slug: string): Promise<TBlogPost | null> {
  const posts = await getAllPostsFallback();
  return posts.find((post) => post.slug === slug) || null;
}

export async function getPostsByCategoryFallback(category: TBlogCategory): Promise<TBlogPost[]> {
  const posts = await getAllPostsFallback();
  if (category === 'all') return posts;
  return posts.filter((post) => post.category === category);
}

export async function getPostsByTagFallback(tag: string): Promise<TBlogPost[]> {
  const posts = await getAllPostsFallback();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getAllTagsFallback(): Promise<string[]> {
  const posts = await getAllPostsFallback();
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export async function getAllCategoriesFallback(): Promise<TBlogCategory[]> {
  const posts = await getAllPostsFallback();
  const categorySet = new Set<TBlogCategory>();
  posts.forEach((post) => {
    categorySet.add(post.category);
  });
  return Array.from(categorySet).sort();
}
