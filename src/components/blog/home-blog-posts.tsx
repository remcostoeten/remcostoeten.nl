import { getVisibleBlogPosts, BLOG_DESCRIPTION } from "@/features/blog";
import { Section } from "../ui/section";
import { HomeBlogPostsClient } from "./home-blog-posts-client";

function HomePostCountHeader({ count }: { count: number }) {
  return (
    <span className="text-xs text-muted-foreground/60 inline-flex items-baseline gap-1">
      {count}
      <span>posts</span>
    </span>
  );
}

export async function HomeBlogPosts() {
  const posts = await getVisibleBlogPosts(false);

  return (
    <Section
      animatedStripes
      title="Posts"
      headerAction={<HomePostCountHeader count={posts.length} />}
      noHeaderMargin
    >
      <div className="px-4 pt-4 md:px-5">
        <div className="border-b border-border/40 pb-4">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80 text-pretty">
            {BLOG_DESCRIPTION}
          </p>
        </div>
        <HomeBlogPostsClient posts={posts} />
      </div>
    </Section>
  );
}
