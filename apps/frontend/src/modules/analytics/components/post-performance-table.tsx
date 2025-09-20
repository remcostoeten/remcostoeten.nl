import { motion } from "framer-motion";
import Link from "next/link";
import { TBlogPost } from "@/modules/blog";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PostPerformanceTableProps {
  posts: TBlogPost[];
}

export const PostPerformanceTable = ({ posts }: PostPerformanceTableProps) => {
  const sortedPosts = [...posts].sort((a, b) => (b.views?.total || 0) - (a.views?.total || 0));

  return (
    <motion.div
      className="bg-card border border-border rounded-lg overflow-hidden"
      {...ANIMATION_CONFIGS.staggered(0.3)}
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Performance metrics for all blog posts
        </p>
      </div>
      
      <ScrollArea className="h-96">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-secondary/20">
            <div className="col-span-5">Post Title</div>
            <div className="col-span-2 text-center">Total Views</div>
            <div className="col-span-2 text-center">Unique Views</div>
            <div className="col-span-2 text-center">Recent (30d)</div>
            <div className="col-span-1 text-center">Category</div>
          </div>
          
          <div className="divide-y divide-border">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary/10 transition-colors items-center"
                {...ANIMATION_CONFIGS.staggered(0.05 * index)}
              >
                <div className="col-span-5">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-foreground hover:text-accent font-medium text-sm line-clamp-2"
                  >
                    {post.title}
                  </Link>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-foreground font-semibold">
                    {post.views?.total?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-muted-foreground">
                    {post.views?.unique?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-muted-foreground">
                    {post.views?.recent?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="col-span-1 text-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-accent/20 border border-accent/40" 
                        title={post.category.replace('-', ' ')}>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};