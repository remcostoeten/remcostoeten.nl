import { getAllCategories } from 'app/blog/utils'
import Link from 'next/link'
import { Hash, FileText, ArrowUpRight } from 'lucide-react'

export const metadata = {
  title: 'Categories',
  description: 'Browse blog posts by category.',
}

export default function CategoriesPage() {
  const categories = getAllCategories()

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Categories</h1>
      
      <ul className="flex flex-col m-0 p-0 list-none">
        {categories.map((category, index) => (
          <li key={category.name} className="block p-0 m-0">
            <Link
              href={`/categories/${category.name.toLowerCase()}`}
              className="group relative block animate-enter active:scale-[0.995] transition-transform duration-200 overflow-hidden first:rounded-t-2xl last:rounded-b-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <article className="relative flex items-center justify-between gap-4 py-8 px-6 border-b border-neutral-800/40 z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-bold text-neutral-700 leading-none flex items-center min-h-[3.5rem] select-none w-16">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Hash className="w-4 h-4 text-lime-400/50" />
                        <h3 className="font-medium text-xl text-neutral-100 group-hover:text-lime-400 transition-colors duration-200 leading-snug">
                          {category.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <FileText className="w-3.5 h-3.5 opacity-60 transition-transform duration-300 group-hover:scale-110" />
                        <span className="tabular-nums font-medium">{category.count}</span>
                        <span className="opacity-60">posts available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-full bg-neutral-800/50 group-hover:bg-lime-400/20 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-110">
                    <ArrowUpRight className="absolute w-5 h-5 text-neutral-500 group-hover:text-lime-400 transition-all duration-300 group-hover:-translate-y-6 group-hover:translate-x-6" />
                    <ArrowUpRight className="absolute w-5 h-5 text-lime-400 -translate-x-6 translate-y-6 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
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
