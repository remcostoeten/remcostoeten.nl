## SEO pre-release checklist

- [x] Titles & Meta Descriptions
  - [x] Unique, keyworded `<title>` and `meta description` per route
  - [x] Titles ~50–60 chars; descriptions ~140–160 chars
- [x] Canonical URLs
  - [x] `<link rel="canonical">` on every indexable page
  - [x] Normalize trailing slash and query params
- [ ] Open Graph & Twitter
  - [x] `og:title`, `og:description`, `og:image (1200x630)`
  - [x] `twitter:card=summary_large_image`
- [ ] Structured Data (JSON-LD)
  - [ ] Person/Website on home
  - [x] Blog/ItemList on posts index
  - [x] Article on post pages
  - [x] BreadcrumbList
- [ ] Sitemap & Robots
  - [x] `app/sitemap.ts` lists all indexable routes with `lastmod`
  - [x] `robots.txt` references sitemap
- [ ] Indexing Controls
  - [x] `noindex` for thin/utility pages
  - [x] Remove `noindex` in prod for real pages
- [ ] Core Web Vitals
  - [ ] LCP optimized (hero image, font preload)
  - [x] CLS stable (image dimensions, font swap)
- [x] JS minimized, route-level code-splitting
- [ ] Accessibility
  - [x] One `h1` per page
  - [x] Alt text for images
  - [x] Landmarks and focus styles
- [ ] Internal Linking
  - [x] Cornerstone pages linked
  - [x] Related posts links

Scope of this PR:
- [x] Implement metadata (title/description) and canonical for core routes
  - [x] `/` Home
  - [x] `/posts` Posts index
  - [x] `/posts/[slug]` Post page
  - [x] `/analytics` Analytics
  - [x] `/contact` Contact

