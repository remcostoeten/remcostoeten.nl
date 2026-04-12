export const BLOG_TOPICS = ["Engineering", "Guides", "Personal"] as const;

export const BLOG_DESCRIPTION =
  "Nothing more than some random thoughts. I don't expect anyone to read these, nor care. When learning a subject, writing it down makes the subject stick way easier, and I simply enjoy it.";
export type BlogTopic = (typeof BLOG_TOPICS)[number];

export type BlogPostMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  tags?: string[];
  topic?: BlogTopic;
  readTime?: string;
  draft?: boolean;
  slug?: string;
  updatedAt?: string;
  canonicalUrl?: string;
  author?: string;
};

export type BlogPost = {
  slug: string;
  content: string;
  metadata: BlogPostMetadata;
};

export type ResolvedBlogPost = BlogPost & {
  views: number;
  uniqueViews: number;
};

export type BlogTopicSummary = {
  name: BlogTopic;
  slug: string;
  count: number;
};
