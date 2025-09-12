import { BlogPost, Category } from '@/components/blog/types';

export const categories: Category[] = [
  { id: '1', name: 'Artificial Intelligence', slug: 'ai' },
  { id: '2', name: 'Design', slug: 'design' },
  { id: '3', name: 'Engineering', slug: 'engineering' },
  { id: '4', name: 'Thoughts', slug: 'thoughts' },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Philosophy of AI Ethics',
    description: 'Can machines make moral decisions?',
    date: '1/12/25',
    category: 'ai',
    slug: 'the-philosophy-of-ai-ethics'
  },
  {
    id: '2',
    title: 'How AI is Changing the Way We Work',
    description: 'AI tools & their impact on productivity.',
    date: '1/16/25',
    category: 'ai',
    slug: 'how-ai-is-changing-the-way-we-work'
  },
  {
    id: '3',
    title: 'The Ethics of Artificial Intelligence',
    description: 'Balancing innovation with responsibility.',
    date: '1/9/25',
    category: 'ai',
    slug: 'ethics'
  },
  {
    id: '4',
    title: 'AI in Everyday Life',
    description: 'AI is seamlessly woven into our daily routines.',
    date: '12/12/24',
    category: 'ai',
    slug: 'ai-in-everyday-life'
  },
  {
    id: '5',
    title: 'Modern Design Principles',
    description: 'Creating intuitive user experiences.',
    date: '1/8/25',
    category: 'design',
    slug: 'modern-design-principles'
  },
  {
    id: '6',
    title: 'The Art of Minimalism',
    description: 'Less is more in digital design.',
    date: '1/5/25',
    category: 'design',
    slug: 'art-of-minimalism'
  },
  {
    id: '7',
    title: 'Building Scalable Systems',
    description: 'Engineering for growth and reliability.',
    date: '1/3/25',
    category: 'engineering',
    slug: 'building-scalable-systems'
  },
  {
    id: '8',
    title: 'The Future of Web Development',
    description: 'Emerging trends and technologies.',
    date: '12/28/24',
    category: 'engineering',
    slug: 'future-of-web-development'
  },
  {
    id: '9',
    title: 'Reflections on Innovation',
    description: 'What drives creative breakthroughs?',
    date: '12/20/24',
    category: 'thoughts',
    slug: 'reflections-on-innovation'
  },
  {
    id: '10',
    title: 'The Power of Curiosity',
    description: 'Why asking questions matters.',
    date: '12/15/24',
    category: 'thoughts',
    slug: 'power-of-curiosity'
  }
];