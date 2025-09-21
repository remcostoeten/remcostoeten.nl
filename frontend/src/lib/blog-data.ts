import { TBlogPost } from '@/modules/blog/types';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const categories: Category[] = [
  { id: '1', name: 'All Posts', slug: 'all' },
  { id: '2', name: 'Development', slug: 'development' },
  { id: '3', name: 'Design', slug: 'design' },
  { id: '4', name: 'Best Practices', slug: 'best-practices' }
];

export const blogPosts: TBlogPost[] = [
  {
    title: 'The Philosophy of AI Ethics',
    excerpt: 'Can machines make moral decisions?',
    content: 'This is a sample blog post content about AI ethics...',
    publishedAt: '2025-01-12',
    readTime: 5,
    tags: ['AI', 'Ethics', 'Philosophy'],
    category: 'development',
    slug: 'the-philosophy-of-ai-ethics',
    status: 'published',
    views: { total: 1250, unique: 980, recent: 45 }
  },
  {
    title: 'How AI is Changing the Way We Work',
    excerpt: 'AI tools & their impact on productivity.',
    content: 'This is a sample blog post content about AI in the workplace...',
    publishedAt: '2025-01-16',
    readTime: 7,
    tags: ['AI', 'Productivity', 'Work'],
    category: 'development',
    slug: 'how-ai-is-changing-the-way-we-work',
    status: 'published',
    views: { total: 2100, unique: 1650, recent: 78 }
  },
  {
    title: 'The Ethics of Artificial Intelligence',
    excerpt: 'Balancing innovation with responsibility.',
    content: 'This is a sample blog post content about AI ethics...',
    publishedAt: '2025-01-09',
    readTime: 6,
    tags: ['AI', 'Ethics', 'Innovation'],
    category: 'best-practices',
    slug: 'ethics',
    status: 'published',
    views: { total: 1800, unique: 1420, recent: 62 }
  },
  {
    title: 'AI in Everyday Life',
    excerpt: 'AI is seamlessly woven into our daily routines.',
    content: 'This is a sample blog post content about AI in daily life...',
    publishedAt: '2024-12-12',
    readTime: 4,
    tags: ['AI', 'Daily Life', 'Technology'],
    category: 'development',
    slug: 'ai-in-everyday-life',
    status: 'published',
    views: { total: 950, unique: 780, recent: 23 }
  },
  {
    title: 'Modern Design Principles',
    excerpt: 'Creating intuitive user experiences.',
    content: 'This is a sample blog post content about design principles...',
    publishedAt: '2025-01-08',
    readTime: 8,
    tags: ['Design', 'UX', 'UI'],
    category: 'design',
    slug: 'modern-design-principles',
    status: 'published',
    views: { total: 1650, unique: 1320, recent: 56 }
  },
  {
    title: 'The Art of Minimalism',
    excerpt: 'Less is more in digital design.',
    content: 'This is a sample blog post content about minimalism in design...',
    publishedAt: '2025-01-05',
    readTime: 5,
    tags: ['Design', 'Minimalism', 'Aesthetics'],
    category: 'design',
    slug: 'art-of-minimalism',
    status: 'published',
    views: { total: 1200, unique: 950, recent: 34 }
  },
  {
    title: 'Building Scalable Systems',
    excerpt: 'Engineering for growth and reliability.',
    content: 'This is a sample blog post content about scalable systems...',
    publishedAt: '2025-01-03',
    readTime: 10,
    tags: ['Engineering', 'Scalability', 'Architecture'],
    category: 'development',
    slug: 'building-scalable-systems',
    status: 'published',
    views: { total: 2400, unique: 1900, recent: 89 }
  },
  {
    title: 'The Future of Web Development',
    excerpt: 'Emerging trends and technologies.',
    content: 'This is a sample blog post content about web development trends...',
    publishedAt: '2024-12-28',
    readTime: 9,
    tags: ['Web Development', 'Technology', 'Future'],
    category: 'development',
    slug: 'future-of-web-development',
    status: 'published',
    views: { total: 1950, unique: 1580, recent: 67 }
  },
  {
    title: 'Reflections on Innovation',
    excerpt: 'What drives creative breakthroughs?',
    content: 'This is a sample blog post content about innovation...',
    publishedAt: '2024-12-20',
    readTime: 6,
    tags: ['Innovation', 'Creativity', 'Reflection'],
    category: 'best-practices',
    slug: 'reflections-on-innovation',
    status: 'published',
    views: { total: 1100, unique: 890, recent: 28 }
  },
  {
    title: 'The Power of Curiosity',
    excerpt: 'Why asking questions matters.',
    content: 'This is a sample blog post content about curiosity...',
    publishedAt: '2024-12-15',
    readTime: 4,
    tags: ['Curiosity', 'Learning', 'Growth'],
    category: 'best-practices',
    slug: 'power-of-curiosity',
    status: 'published',
    views: { total: 850, unique: 680, recent: 19 }
  }
];