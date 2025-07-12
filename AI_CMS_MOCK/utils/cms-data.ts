import { Page, ContentBlock, ContentSegment } from '../types/cms';

// Mock data for demonstration
export const mockPages: Page[] = [
  {
    id: '1',
    slug: 'about',
    title: 'About Me',
    description: 'Personal introduction and experience',
    isPublished: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        order: 0,
        content: [
          {
            id: 'seg-1',
            type: 'text',
            content: 'I craft digital experiences.'
          }
        ]
      },
      {
        id: 'block-2',
        type: 'paragraph',
        order: 1,
        content: [
          {
            id: 'seg-2',
            type: 'text',
            content: 'With extensive experience in '
          },
          {
            id: 'seg-3',
            type: 'highlighted',
            content: 'TypeScript and React & Next.js',
            data: { hslColor: '85 100% 75%' }
          },
          {
            id: 'seg-4',
            type: 'text',
            content: ', I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an '
          },
          {
            id: 'seg-5',
            type: 'highlighted',
            content: 'LMS system for Dutch MBO students',
            data: { hslColor: '85 100% 75%' }
          },
          {
            id: 'seg-6',
            type: 'text',
            content: '.'
          }
        ]
      },
      {
        id: 'block-3',
        type: 'paragraph',
        order: 2,
        content: [
          {
            id: 'seg-7',
            type: 'text',
            content: 'Recently I\'ve been building '
          },
          {
            id: 'seg-8',
            type: 'link',
            content: 'Roll Your Own Authentication',
            data: { url: 'https://github.com/example/auth' }
          },
          {
            id: 'seg-9',
            type: 'text',
            content: ' and '
          },
          {
            id: 'seg-10',
            type: 'link',
            content: 'Turso DB Creator CLI',
            data: { url: 'https://github.com/example/turso-cli' }
          },
          {
            id: 'seg-11',
            type: 'text',
            content: ' and various '
          },
          {
            id: 'seg-12',
            type: 'highlighted',
            content: 'CLI tools & automation scripts',
            data: { hslColor: '85 100% 75%' }
          },
          {
            id: 'seg-13',
            type: 'text',
            content: '. More projects and experiments can be found on '
          },
          {
            id: 'seg-14',
            type: 'link',
            content: 'GitHub',
            data: { url: 'https://github.com' }
          },
          {
            id: 'seg-15',
            type: 'text',
            content: '.'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    slug: 'projects',
    title: 'Projects',
    description: 'My recent work and projects',
    isPublished: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    blocks: [
      {
        id: 'block-4',
        type: 'heading',
        order: 0,
        content: [
          {
            id: 'seg-16',
            type: 'text',
            content: 'My Projects'
          }
        ]
      }
    ]
  }
];

export const createNewPage = (): Omit<Page, 'id'> => ({
  slug: 'new-page',
  title: 'New Page',
  description: 'A new page description',
  isPublished: false,
  blocks: [
    {
      id: `block-${Date.now()}`,
      type: 'heading',
      order: 0,
      content: [{
        id: `seg-${Date.now()}`,
        type: 'text',
        content: 'New Page Title'
      }]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

export const createNewBlock = (type: 'heading' | 'paragraph', order: number): Omit<ContentBlock, 'id'> => ({
  type,
  order,
  content: [
    {
      id: generateId(),
      type: 'text',
      content: type === 'heading' ? 'New Heading' : 'New paragraph content.'
    }
  ]
});

export const createNewSegment = (type: ContentSegment['type'] = 'text'): Omit<ContentSegment, 'id'> => ({
  type,
  content: 'New content',
  data: type === 'highlighted' ? { hslColor: '85 100% 75%' } : undefined
});

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};