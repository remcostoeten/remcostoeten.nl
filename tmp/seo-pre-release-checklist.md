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
  - [ ] `app/sitemap.ts` lists all indexable routes with `lastmod`
  - [ ] `robots.txt` references sitemap
- [ ] Indexing Controls
  - [ ] `noindex` for thin/utility pages
  - [ ] Remove `noindex` in prod for real pages
- [ ] Core Web Vitals
  - [ ] LCP optimized (hero image, font preload)
  - [ ] CLS stable (image dimensions, font swap)
  - [ ] JS minimized, route-level code-splitting
- [ ] Accessibility
  - [ ] One `h1` per page
  - [ ] Alt text for images
  - [ ] Landmarks and focus styles
- [ ] Internal Linking
  - [ ] Cornerstone pages linked
  - [ ] Related posts links

Scope of this PR:
- [x] Implement metadata (title/description) and canonical for core routes
  - [x] `/` Home
  - [x] `/posts` Posts index
  - [x] `/posts/[slug]` Post page
  - [x] `/analytics` Analytics
  - [x] `/contact` Contact

