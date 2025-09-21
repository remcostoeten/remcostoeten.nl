import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostMetadata {
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  category: string;
  status: string;
  author: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  category: string;
  status: string;
  author: string;
  readTime: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const files = fs.readdirSync(contentDirectory);
  const posts: BlogPost[] = [];

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue;

    const slug = file.replace(/\.mdx$/, '');
    const filePath = path.join(contentDirectory, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Skip if not published
    if (data.status !== 'published') continue;

    // Handle different date formats
    let publishedAt = data.publishedAt || data.date || new Date().toISOString();
    
    // Convert DD-MM-YYYY format to ISO
    if (typeof publishedAt === 'string' && publishedAt.includes('-')) {
      const parts = publishedAt.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        // DD-MM-YYYY format
        const [day, month, year] = parts;
        publishedAt = new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
      } else if (!publishedAt.includes('T')) {
        // YYYY-MM-DD format without time
        publishedAt = new Date(publishedAt + 'T00:00:00Z').toISOString();
      }
    }

    posts.push({
      slug,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      publishedAt,
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || 'development',
      status: data.status || 'published',
      author: data.author || 'Remco Stoeten',
      readTime: calculateReadTime(content),
      seo: data.seo
    });
  }

  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find(post => post.slug === slug) || null;
}
