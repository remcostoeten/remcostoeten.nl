import { motion } from "framer-motion";
import Link from "next/link";
import { TBlogPost } from "@/modules/blog";
import { ANIMATION_CONFIGS } from "@/modules/shared";

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
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Total Views</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Unique Views</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Recent (30d)</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Category</th>
            </tr>
          </thead>
          <tbody>
            {sortedPosts.map((post, index) => (
              <motion.tr
                key={post.slug}
                className="border-b border-border hover:bg-secondary/10 transition-colors"
                {...ANIMATION_CONFIGS.staggered(0.05 * index)}
              >
                <td className="py-4 px-6">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-foreground hover:text-accent font-medium"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="py-4 px-6 text-foreground font-medium">
                  {post.views?.total?.toLocaleString() || 0}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {post.views?.unique?.toLocaleString() || 0}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {post.views?.recent?.toLocaleString() || 0}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded capitalize">
                    {post.category.replace('-', ' ')}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};