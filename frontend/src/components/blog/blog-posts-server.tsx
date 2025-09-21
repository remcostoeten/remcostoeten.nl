import { getAllPosts } from '@/lib/blog';
import { TBlogPost } from '@/lib/blog/types';

export async function getBlogPosts(): Promise<TBlogPost[]> {
  return await getAllPosts();
}
