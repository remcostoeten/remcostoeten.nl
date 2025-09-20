import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/mdx-components';
import { TBlogPost } from '@/lib/blog/types';
import { formatPostDate, getRelatedPostsClient } from '@/lib/blog/client';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIGS } from '@/modules/shared';

interface BlogPostProps {
  post: TBlogPost;
  relatedPosts?: TBlogPost[];
}

export function BlogPost({ post, relatedPosts = [] }: BlogPostProps) {
  const related = relatedPosts.length > 0 ? relatedPosts : [];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.header 
        className="mb-8"
        {...ANIMATION_CONFIGS.fadeInUp}
      >
        <div className="mb-4">
          <Link 
            href="/posts"
            className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1.5 group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to blog
          </Link>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
          {post.title}
        </h1>
        
        <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
          {post.excerpt}
        </p>
        
        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatPostDate(post.publishedAt)}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{post.readTime} min read</span>
          </div>
          
          {post.views && (
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.views.total.toLocaleString()} views</span>
            </div>
          )}
          
          {post.author && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </motion.header>
      
      {/* Content */}
      <motion.div 
        className="prose prose-lg max-w-none"
        {...ANIMATION_CONFIGS.staggered(0.2)}
      >
        <MDXRemote 
          source={post.content} 
          components={mdxComponents}
        />
      </motion.div>
      
      {/* Related Posts */}
      {related.length > 0 && (
        <motion.section 
          className="mt-16 pt-8 border-t border-border"
          {...ANIMATION_CONFIGS.staggered(0.4)}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Related Posts
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedPost, index) => (
              <motion.div
                key={relatedPost.slug}
                className="group"
                {...ANIMATION_CONFIGS.staggered(0.1 * index)}
              >
                <Link 
                  href={`/posts/${relatedPost.slug}`}
                  className="block p-4 border border-border rounded-lg hover:border-accent transition-colors"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatPostDate(relatedPost.publishedAt)}</span>
                    <span>{relatedPost.readTime} min read</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </article>
  );
}
