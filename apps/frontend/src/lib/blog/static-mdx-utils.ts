import { TBlogPost, TBlogMetadata, TBlogCategory } from './types';

// Static blog posts data - this will be populated from MDX files
const staticPosts: TBlogPost[] = [
  {
    title: "Getting Started with MDX",
    excerpt: "A comprehensive guide to setting up and using MDX in your Next.js projects for rich content experiences.",
    content: `# Getting Started with MDX

MDX allows you to write JSX in your Markdown documents. It's a powerful way to create dynamic and interactive content.

## What is MDX?

MDX is an authorable format that lets you seamlessly write JSX in your Markdown documents. You can import components, like React components, and use them in your Markdown. This is incredibly useful for:

- **Interactive Blogs**: Embed live React components directly into your blog posts.
- **Documentation**: Create rich, interactive documentation with code examples that run live.
- **Component Playgrounds**: Showcase components with editable code.

## Setup in Next.js

To use MDX in a Next.js project, you typically need to configure \`next.config.js\` and set up a way to render MDX content.

### 1. Install Dependencies

First, install the necessary packages:

\`\`\`bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
\`\`\`

### 2. Configure \`next.config.js\`

Modify your \`next.config.js\` to include MDX:

\`\`\`javascript
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Any other Next.js config
});
\`\`\`

### 3. Create MDX Components

You can define custom React components to render standard Markdown elements (like \`h1\`, \`p\`, \`a\`, \`code\`) or create entirely new components.

\`\`\`tsx
// src/components/mdx-components.tsx
import { ReactNode } from 'react';
import Link from 'next/link';

export function CustomH1({ children }: { children: ReactNode }) {
  return <h1 className="text-4xl font-bold my-4">{children}</h1>;
}

export function CustomLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-blue-500 hover:underline">{children}</Link>;
}

export const mdxComponents = {
  h1: CustomH1,
  a: CustomLink,
  // ... other components
};
\`\`\`

### 4. Render MDX Content

In your page or component, you can use \`next-mdx-remote/rsc\` to render your MDX files.

\`\`\`tsx
// src/app/posts/[slug]/page.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx-components';
import { getPostBySlug } from '@/lib/blog'; // Assuming this fetches MDX content

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <MDXRemote source={post.content} components={mdxComponents} />
    </article>
  );
}
\`\`\`

## Embedding React Components

The real power of MDX comes from embedding React components.

\`\`\`mdx
---
title: "My Interactive Post"
---

# Welcome

This is a regular markdown paragraph.

<MyCustomComponent prop1="hello" prop2="world" />

Another paragraph.
\`\`\`

Where \`MyCustomComponent\` would be imported and passed to \`MDXRemote\`'s \`components\` prop.

## Conclusion

MDX provides a fantastic way to combine the simplicity of Markdown with the power of React components, enabling highly dynamic and engaging content.`,
    publishedAt: "2024-07-20T00:00:00Z",
    readTime: 8,
    tags: ["MDX", "Next.js", "Content Management", "React"],
    category: "development",
    slug: "getting-started-with-mdx",
    status: "published",
    author: "Remco Stoeten",
    seo: {
      title: "MDX Tutorial: Getting Started with MDX in Next.js",
      description: "Learn how to integrate MDX into your Next.js application, create custom components, and build a powerful content authoring experience.",
      keywords: ["MDX tutorial", "Next.js MDX", "React MDX", "content authoring", "markdown JSX"]
    }
  }
];

export function getAllMdxFiles(): string[] {
  return staticPosts.map(post => post.slug);
}

export function getMdxContent(slug: string): string {
  const post = staticPosts.find(p => p.slug === slug);
  return post?.content || '';
}

export function getMdxMetadata(slug: string): TBlogMetadata | null {
  const post = staticPosts.find(p => p.slug === slug);
  if (!post) return null;

  return {
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
    tags: post.tags,
    category: post.category,
    slug: post.slug,
    status: post.status,
    author: post.author,
    seo: post.seo
  };
}

export function getAllMdxPosts(): TBlogPost[] {
  return [...staticPosts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getMdxPostBySlug(slug: string): TBlogPost | null {
  return staticPosts.find(post => post.slug === slug) || null;
}

export function getMdxPostsByCategory(category: TBlogCategory): TBlogPost[] {
  const posts = getAllMdxPosts();
  if (category === 'all') return posts;
  return posts.filter(post => post.category === category);
}

export function getMdxPostsByTag(tag: string): TBlogPost[] {
  const posts = getAllMdxPosts();
  return posts.filter(post => post.tags.includes(tag));
}

export function getAllMdxTags(): string[] {
  const posts = getAllMdxPosts();
  const tagSet = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function getAllMdxCategories(): TBlogCategory[] {
  const posts = getAllMdxPosts();
  const categorySet = new Set<TBlogCategory>();
  posts.forEach(post => {
    categorySet.add(post.category);
  });
  return Array.from(categorySet).sort();
}

export function getRelatedMdxPosts(currentPost: TBlogPost, limit: number = 3): TBlogPost[] {
  const posts = getAllMdxPosts();
  return posts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      // Calculate relevance score based on shared tags and category
      let score = 0;
      if (post.category === currentPost.category) score += 2;

      const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      score += sharedTags.length;

      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}
