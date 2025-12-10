import { getAllCategories } from '@/utils/utils'
import Link from 'next/link'
import { Hash } from 'lucide-react'
import { topicsMetadata } from '@/core/metadata'

export { topicsMetadata as metadata }

export default function TopicsPage() {
  const categories = getAllCategories()

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Topics</h1>

      <ul className="flex flex-col m-0 p-0 list-none" role="list">
        {categories.map((category, index) => (
          <li key={category.name} className="block p-0 m-0">
            <Link
              href={`/topics/${category.name.toLowerCase()}`}
              className="group relative block animate-stagger overflow-hidden first:rounded-t-2xl last:rounded-b-2xl [&:last-child>article]:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                aria-hidden="true"
              />

              <article className="relative flex items-center justify-between gap-4 py-6 px-4 border-b border-neutral-800/60 z-10">
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-neutral-600 group-hover:text-lime-400 transition-colors" />
                  <span className="font-medium text-neutral-100 group-hover:text-lime-400 transition-colors">
                    {category.name}
                  </span>
                </div>

                <span className="text-sm text-neutral-500 tabular-nums">
                  {category.count} {category.count === 1 ? 'post' : 'posts'}
                </span>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
