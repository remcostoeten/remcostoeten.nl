import { getBlogPostsByCategory, getAllCategories } from '@/utils/utils'
import { formatDate } from '@/utils/client-utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Hash, Calendar, ArrowUpRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((cat) => ({
    category: cat.name.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  return {
    title: `${decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)} Posts`,
    description: `Browse all posts in the ${decodedCategory} category.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const posts = getBlogPostsByCategory(decodedCategory)

  if (posts.length === 0) {
    notFound()
  }

  const categoryName = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)

  return (
    <section>
      <Link
        href="/blog/categories"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to categories
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Hash className="w-6 h-6 text-lime-400" />
          <h1 className="font-semibold text-3xl tracking-tighter text-foreground">
            {categoryName}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this category
        </p>
      </div>

      <ul className="flex flex-col m-0 p-0 list-none">
        {posts
          .sort((a, b) => {
            if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
              return -1
            }
            return 1
          })
          .map((post, index) => (
            <li key={post.slug} className="block p-0 m-0">
              <Link
                href={`/blog/${post.slug}`}
                className="group relative block animate-stagger active:scale-[0.995] transition-transform overflow-hidden first:rounded-t-2xl last:rounded-b-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <article className="relative flex items-center justify-between gap-4 py-6 px-4 border-b border-neutral-800/40 z-10">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-neutral-100 group-hover:text-lime-400 transition-colors leading-snug mb-2">
                      {post.metadata.title}
                    </h3>

                    <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                      {post.metadata.summary}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.metadata.publishedAt)}</span>
                      </div>

                      {post.metadata.categories && post.metadata.categories.length > 0 && (
                        <div className="flex items-center gap-2">
                          {post.metadata.categories.map(cat => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded-full bg-neutral-800/50 text-neutral-400"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="relative w-10 h-10 rounded-full bg-neutral-800/50 group-hover:bg-lime-400/20 flex items-center justify-center overflow-hidden transition-colors">
                      <ArrowUpRight className="absolute w-4 h-4 text-neutral-500 group-hover:text-lime-400 transition-all duration-150 group-hover:-translate-y-5 group-hover:translate-x-5" />
                      <ArrowUpRight className="absolute w-4 h-4 text-lime-400 -translate-x-5 translate-y-5 transition-all duration-150 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                  </div>
                </article>
              </Link>
            </li>
          ))}
      </ul>
    </section>
  )
}
