#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE}/api/blog/metadata`;

type TBlogMetadata = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: 'development' | 'design' | 'best-practices';
  status: 'published' | 'draft';
  author?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

function getReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.ceil(stats.minutes);
}

async function syncBlogMetadata() {
  const contentDirectory = path.join(process.cwd(), 'content/blog');
  
  if (!fs.existsSync(contentDirectory)) {
    console.log('No content/blog directory found');
    return;
  }

  const filenames = fs.readdirSync(contentDirectory);
  const mdxFiles = filenames.filter((name) => name.endsWith('.mdx') || name.endsWith('.md'));

  console.log(`Found ${mdxFiles.length} MDX files`);

  for (const filename of mdxFiles) {
    const slug = getSlugFromFilename(filename);
    const filePath = path.join(contentDirectory, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    let publishedAt = data.publishedAt || new Date().toISOString();
    if (publishedAt && !publishedAt.includes('T')) {
      publishedAt = new Date(publishedAt + 'T00:00:00Z').toISOString();
    }

    const metadata: TBlogMetadata = {
      slug,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      publishedAt,
      readTime: getReadingTime(content),
      tags: data.tags || [],
      category: data.category || 'development',
      status: data.status || 'published',
      author: data.author,
      seo: data.seo,
    };

    try {
      const existingResponse = await fetch(`${API_ENDPOINT}/${slug}`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (existingResponse.ok) {
        const updateResponse = await fetch(`${API_ENDPOINT}/${slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
          signal: AbortSignal.timeout(5000)
        });

        if (updateResponse.ok) {
          console.log(`✅ Updated metadata for: ${slug}`);
        } else {
          const errorText = await updateResponse.text();
          console.error(`❌ Failed to update metadata for: ${slug}`, errorText);
        }
      } else {
        // Create new metadata
        const createResponse = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
          signal: AbortSignal.timeout(5000)
        });

        if (createResponse.ok) {
          console.log(`✅ Created metadata for: ${slug}`);
        } else {
          const errorText = await createResponse.text();
          console.error(`❌ Failed to create metadata for: ${slug}`, errorText);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`⏱️ Timeout syncing ${slug} (API not available)`);
      } else if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
        console.log(`🔌 API not available for ${slug} (connection refused)`);
      } else {
        console.log(`⚠️ Skipping sync for ${slug} (API unavailable)`);
      }
    }
  }

  console.log('Blog metadata sync completed');
}

// Run the sync
syncBlogMetadata().catch(console.error);
