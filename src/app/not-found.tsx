import Link from 'next/link'
import { Home, FileText, Search, ArrowLeft } from 'lucide-react'
import { baseUrl } from './sitemap'

export default function NotFound() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "404 - Page Not Found",
    "description": "The page you're looking for could not be found. Return to the homepage or browse the blog.",
    "url": `${baseUrl}/404`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/404`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="space-y-6 max-w-lg">
          {/* 404 Graphic */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-bold text-muted-foreground/20 tracking-tighter">
              404
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full" />
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Page not found
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The page you're looking for seems to have vanished into the digital void.
              Don't worry though, let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none AAAA bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none AAAA border border-border bg-background hover:bg-muted/50 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              Browse Blog
            </Link>
          </div>

          {/* Helpful Suggestions */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <h3 className="font-medium text-foreground">Maybe you were looking for:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Latest blog posts
              </Link>
              <Link href="/blog/categories" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Browse by category
              </Link>
              <Link href="/blog/topics" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Popular topics
              </Link>
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                About me
              </Link>
            </div>
          </div>

          {/* Search Hint */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              <Search className="inline w-3.5 h-3.5 mr-1" />
              Tip: Use the search bar to find specific content
            </p>
            <form action="/search" method="get" className="flex items-center gap-2 pt-2">
              <input type="search" name="q" placeholder="Search..." className="py-1 pl-8 text-sm text-muted-foreground rounded-none AAAA bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-none AAAA bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
