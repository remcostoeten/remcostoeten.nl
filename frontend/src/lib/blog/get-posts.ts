'use server';

import { TBlogPost, TBlogCategory } from './types';
// Import MDX utilities directly (server-side only)
import { 
  getAllMdxPosts,
  getMdxPostBySlug,
  getMdxPostsByCategory,
  getMdxPostsByTag,
  getAllMdxTags,
  getAllMdxCategories,
  getRelatedMdxPosts
} from './static-mdx-utils';

export async function getAllPosts(): Promise<TBlogPost[]> {
  // Always use static data for now to avoid build issues
  return getAllMdxPosts();
}

export async function getPostBySlug(slug: string): Promise<TBlogPost | null> {
  // Always use static data for now to avoid build issues
  return getMdxPostBySlug(slug);
}

export async function getPostsByCategory(category: TBlogCategory): Promise<TBlogPost[]> {
  return getMdxPostsByCategory(category);
}

export async function getPostsByTag(tag: string): Promise<TBlogPost[]> {
  return getMdxPostsByTag(tag);
}

export async function getAllTags(): Promise<string[]> {
  return getAllMdxTags();
}

export async function getAllCategories(): Promise<TBlogCategory[]> {
  return getAllMdxCategories();
}

export async function getRelatedPosts(currentPost: TBlogPost, limit: number = 3): Promise<TBlogPost[]> {
  return getRelatedMdxPosts(currentPost, limit);
}
