import { Helmet } from "react-helmet-async";
import { TBlogPost, TBlogCategory } from "@/modules/blog";

interface BlogSEOProps {
  post?: TBlogPost;
  category?: TBlogCategory;
  siteName?: string;
  siteUrl?: string;
}

export const BlogSEO = ({ 
  post, 
  category, 
  siteName = "Your Portfolio", 
  siteUrl = "https://yourportfolio.com" 
}: BlogSEOProps) => {
  if (post) {
    // Individual blog post SEO
    const title = `${post.title} | ${siteName}`;
    const description = post.excerpt;
    const url = `${siteUrl}/blog/${post.slug}`;
    const publishedTime = new Date(post.publishedAt).toISOString();
    
    return (
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={post.tags.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={publishedTime} />
        <meta property="article:section" content={post.category} />
        {post.tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={description} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={url} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": description,
            "datePublished": publishedTime,
            "dateModified": publishedTime,
            "author": {
              "@type": "Person",
              "name": "Your Name"
            },
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "url": siteUrl
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": url
            },
            "keywords": post.tags.join(', '),
            "wordCount": post.content.split(' ').length,
            "timeRequired": `PT${post.readTime}M`
          })}
        </script>
      </Helmet>
    );
  }

  if (category) {
    // Category page SEO
    const categoryNames: Record<TBlogCategory, string> = {
      'all': 'All Posts',
      'development': 'Development',
      'design': 'Design',
      'best-practices': 'Best Practices'
    };
    
    const categoryName = categoryNames[category];
    const title = category === 'all' 
      ? `Blog | ${siteName}` 
      : `${categoryName} Posts | ${siteName}`;
    const description = category === 'all'
      ? "Thoughts on frontend development, design, and building better web experiences."
      : `Read about ${categoryName.toLowerCase()} topics including best practices, tutorials, and insights.`;
    const url = category === 'all' 
      ? `${siteUrl}/blog` 
      : `${siteUrl}/blog/category/${category}`;

    return (
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={url} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": title,
            "description": description,
            "url": url,
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "url": siteUrl
            }
          })}
        </script>
      </Helmet>
    );
  }

  return null;
};