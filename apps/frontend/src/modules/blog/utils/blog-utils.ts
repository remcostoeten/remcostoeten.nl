// Re-export client-side utilities from the main blog library
export { 
  filterPostsByCategory,
  filterPostsByTags,
  filterPostsByCategoryAndTags,
  getCategoryDisplayName,
  searchPosts,
  formatPostDate,
  getRelatedPosts
} from '@/lib/blog';

export const getPostReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const generatePostExcerpt = (content: string, maxLength: number = 160): string => {
  // Remove markdown formatting for excerpt
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};