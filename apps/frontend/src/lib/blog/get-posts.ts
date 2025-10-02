'use server';

import { TBlogPost, TBlogCategory } from './types';
// Import MDX utilities (filesystem-based)
import {
  getAllMdxPosts,
  getMdxPostBySlug,
  getMdxPostsByCategory,
  getMdxPostsByTag,
  getAllMdxTags,
  getAllMdxCategories,
  getRelatedMdxPosts
} from './mdx-utils';

export async function getAllPosts(): Promise<TBlogPost[]> {
  return getAllMdxPosts();
}

export async function getPostBySlug(slug: string): Promise<TBlogPost | null> {
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
