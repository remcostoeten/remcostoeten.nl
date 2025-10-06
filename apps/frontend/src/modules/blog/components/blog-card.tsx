import { motion } from "framer-motion";
import Link from "next/link";
import { TBlogPost } from "../types";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface BlogCardProps {
  post: TBlogPost;
  index: number;
}

export const BlogCard = ({ post, index }: BlogCardProps) => {
  return (
    <motion.article
      className="font-noto border border-border rounded-lg p-6 bg-card hover:bg-secondary/50 transition-colors"
      {...ANIMATION_CONFIGS.staggered(index * 0.1)}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <time>{new Date(post.publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}</time>
        <span>•</span>
        <span>{post.readTime} min read</span>
        <span>•</span>
        <span>{post.views?.total?.toLocaleString() || 0} views</span>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-3">
        <Link
          href={`/posts/${post.slug}`}
          className="hover:text-accent transition-colors"
        >
          {post.title}
        </Link>
      </h2>

      <p className="text-muted-foreground mb-4 leading-relaxed">
        {post.excerpt}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/posts?tags=${encodeURIComponent(tag)}`}
            className="px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border text-xs rounded-full font-medium transition-all hover:border-accent/40"
          >
            {tag}
          </Link>
        ))}
      </div>

      <Link
        href={`/posts/${post.slug}`}
        className="text-accent hover:underline font-medium text-sm inline-flex items-center gap-1.5 group"
      >
        Read more
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </motion.article>
  );
};