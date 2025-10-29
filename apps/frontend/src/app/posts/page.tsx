import Link from "next/link"
import type { Metadata } from "next"
import { buildSeo } from "@/lib/seo"
import { getAllBlogPosts } from "@/lib/blog/filesystem-utils"
import { BlogPostsClient } from "./blog-posts-client"
import { BreadcrumbNavigation } from "@/components/blog/breadcrumb-navigation"
import type { BreadcrumbItem } from "@/lib/blog/breadcrumb-utils"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Remco Stoeten - Frontend Engineering & Web Development",
    description:
      "In-depth articles on React, Next.js, TypeScript, performance optimization, and modern web development best practices by Remco Stoeten.",
    keywords:
      "Remco Stoeten, frontend development, React, Next.js, TypeScript, web development, JavaScript, performance optimization, UI/UX",
    authors: [{ name: "Remco Stoeten" }],
    alternates: {
      canonical: "https://remcostoeten.nl/posts",
    },
    ...buildSeo({
      title: "Blog | Remco Stoeten",
      description:
        "In-depth articles on React, Next.js, TypeScript, performance optimization, and modern web development best practices.",
      url: "/posts",
    }),
  }
}

export default async function PostsPage() {
  const allPosts = getAllBlogPosts()
  const featuredPosts = allPosts.slice(0, 3)

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/posts", current: true },
  ]

  const siteUrl = "https://remcostoeten.nl"

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Remco Stoeten Blog",
    url: `${siteUrl}/posts`,
    description:
      "In-depth articles on React, Next.js, TypeScript, performance optimization, and modern web development.",
    author: {
      "@type": "Person",
      name: "Remco Stoeten",
      url: siteUrl,
      jobTitle: "Frontend Engineer",
      knowsAbout: ["React", "Next.js", "TypeScript", "Web Development", "UI/UX Design"],
    },
    publisher: {
      "@type": "Person",
      name: "Remco Stoeten",
      url: siteUrl,
    },
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/posts/${post.slug}`,
      name: post.title,
    })),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/posts`,
      },
    ],
  }

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Remco Stoeten",
    url: siteUrl,
    jobTitle: "Frontend Engineer",
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Web Development",
      "UI/UX Design",
      "Performance Optimization",
    ],
    sameAs: [
      "https://github.com/remcostoeten",
      "https://twitter.com/remcostoeten",
      "https://linkedin.com/in/remcostoeten",
    ],
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <div className="min-h-screen bg-background">
        {/* Mobile-optimized container with proper spacing */}
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation - Accessible and SEO-friendly */}
          <BreadcrumbNavigation items={breadcrumbs} className="mb-6" />

          {/* Fallback for users without JavaScript */}
          <noscript>
            <Link href="/" className="text-accent hover:underline text-sm mb-6 inline-flex items-center gap-2 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to home
            </Link>
          </noscript>

          {/* Header Section - Mobile-first, concise */}
          <header className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance">Writing</h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed text-pretty">
              Thoughts on frontend development, design systems, and building better web experiences.
            </p>
          </header>

          {/* Featured Posts - Prioritized for mobile viewport */}
          {featuredPosts.length > 0 && (
            <section className="mb-10 sm:mb-12" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">
                Featured Articles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="group relative rounded-lg border border-border bg-card p-5 transition-all hover:border-accent/50 hover:shadow-lg overflow-hidden"
                  >
                    <Link href={`/posts/${post.slug}`} className="block">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2 text-balance break-words hyphens-auto line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                        <span>•</span>
                        <span>{post.readTime} min read</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* All Posts - Client component with filtering */}
          <BlogPostsClient allPosts={allPosts} />
        </div>
      </div>
    </>
  )
}
