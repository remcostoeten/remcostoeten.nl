#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE}/api/blog/metadata`;
const contentDirectory = path.join(process.cwd(), 'content/blog');

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
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

async function syncBlogMetadata() {
  console.log('🔄 Syncing blog metadata...');
  
  if (!fs.existsSync(contentDirectory)) {
    console.log('❌ No content/blog directory found');
    return;
  }

  const filenames = fs.readdirSync(contentDirectory);
  const mdxFiles = filenames.filter((name) => name.endsWith('.mdx') || name.endsWith('.md'));

  console.log(`📝 Found ${mdxFiles.length} MDX files`);

  for (const filename of mdxFiles) {
    const slug = getSlugFromFilename(filename);
    const filePath = path.join(contentDirectory, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Convert date to ISO format if it's not already
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
      // Check if metadata already exists
      const existingResponse = await fetch(`${API_ENDPOINT}/${slug}`);

      if (existingResponse.ok) {
        // Update existing metadata
        const updateResponse = await fetch(`${API_ENDPOINT}/${slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
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
        });

        if (createResponse.ok) {
          console.log(`✅ Created metadata for: ${slug}`);
        } else {
          const errorText = await createResponse.text();
          console.error(`❌ Failed to create metadata for: ${slug}`, errorText);
        }
      }
    } catch (error) {
      console.error(`❌ Error syncing ${slug}:`, error);
    }
  }

  console.log('✅ Blog metadata sync completed');
}

async function listBlogPosts() {
  console.log('📋 Listing blog posts...');

  try {
    const response = await fetch(API_ENDPOINT);
    const result = await response.json();
    
    if (result.success) {
      const posts = result.data;
      console.log(`\n📝 Found ${posts.length} blog posts:\n`);
      
      posts.forEach((post: any, index: number) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   Author: ${post.author || 'Unknown'}`);
        console.log(`   Category: ${post.category}`);
        console.log(`   Status: ${post.status}`);
        console.log(`   Published: ${new Date(post.publishedAt).toLocaleDateString()}`);
        console.log(`   Views: ${post.analytics?.totalViews || 0}`);
        console.log(`   Tags: ${post.tags.join(', ')}`);
        console.log('');
      });
    } else {
      console.error('❌ Failed to fetch blog posts');
    }
  } catch (error) {
    console.error('❌ Error listing blog posts:', error);
  }
}

async function createNewPost() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    console.log('📝 Creating new blog post...\n');
    
    const title = await question('Title: ');
    const slug = await question('Slug: ');
    const excerpt = await question('Excerpt: ');
    const category = await question('Category (development/design/best-practices): ');
    const tags = await question('Tags (comma-separated): ');
    const author = await question('Author: ');
    
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const mdxContent = `---
title: "${title}"
excerpt: "${excerpt}"
publishedAt: "${new Date().toISOString().split('T')[0]}"
tags: [${tagsArray.map(tag => `"${tag}"`).join(', ')}]
category: "${category}"
status: "draft"
author: "${author}"
seo:
  title: "${title} - Your Site Name"
  description: "${excerpt}"
  keywords: [${tagsArray.map(tag => `"${tag}"`).join(', ')}]
---

# ${title}

${excerpt}

<!-- Add your content here -->
`;

    const filename = `${slug}.mdx`;
    const filePath = path.join(contentDirectory, filename);
    
    fs.writeFileSync(filePath, mdxContent);
    console.log(`✅ Created ${filename}`);
    
    // Sync with internal API
    await syncBlogMetadata();
    
  } catch (error) {
    console.error('❌ Error creating post:', error);
  } finally {
    rl.close();
  }
}

// Main CLI
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'sync':
      await syncBlogMetadata();
      break;
    case 'list':
      await listBlogPosts();
      break;
    case 'create':
      await createNewPost();
      break;
    default:
      console.log(`
📝 Blog Management CLI

Usage: npx tsx scripts/blog-management.ts <command>

Commands:
  sync    - Sync MDX files with internal API metadata
  list    - List all blog posts
  create  - Create a new blog post

Examples:
  npx tsx scripts/blog-management.ts sync
  npx tsx scripts/blog-management.ts list
  npx tsx scripts/blog-management.ts create
      `);
  }
}

main().catch(console.error);
