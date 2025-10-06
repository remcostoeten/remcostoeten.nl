import { getAllBlogPosts } from "@/lib/blog/filesystem-utils";
import { BlogSectionClient } from "./blog-section-client";

export async function BlogSection() {
  // Get posts from filesystem
  const allPosts = getAllBlogPosts();

  // Get the 3 most recent posts
  const recentPosts = allPosts.slice(0, 3);

  return <BlogSectionClient posts={recentPosts} totalPosts={allPosts.length} />;
};