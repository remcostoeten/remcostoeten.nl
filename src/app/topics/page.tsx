import { getAllCategories } from 'src/utils/utils'
import Link from 'next/link'
import { Hash, FileText, ArrowUpRight } from 'lucide-react'

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
              className="group relative block animate-stagger active:scale-[0.995] transition-transform overflow-hidden first:rounded-t-2xl last:rounded-b-2xl [&:last-child>article]:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Neutral gradient background on hover */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                aria-hidden="true"
              />

              <article className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-8 px-6 border-b border-neutral-800/60 z-10">
                <div className="flex-1 min-w-0">
                  <header className="flex items-start gap-3">
                    <span
                      className="text-4xl font-bold text-neutral-600/30 leading-none flex items-center min-h-[3.5rem] select-none tabular-nums"
                      aria-hidden="true"
                    >
                      {(index + 1).toString().padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Hash className="w-4 h-4 text-lime-400/50" />
                        <h3 className="font-medium text-xl text-neutral-100 group-hover:text-lime-400 transition-colors leading-snug">
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <FileText className="w-3.5 h-3.5 opacity-60 transition-transform group-hover:scale-110" />
                        <span className="tabular-nums font-medium">{category.count}</span>
                        <span className="opacity-60">posts available</span>
                      </div>
                    </div>
                  </header>
                </div>

                <div className="flex-shrink-0 ml-auto sm:ml-0" aria-hidden="true">
                  <div className="relative w-10 h-10 rounded-full bg-neutral-900/60 group-hover:bg-lime-500/20 flex items-center justify-center overflow-hidden transition-colors">
                    <ArrowUpRight className="absolute w-4 h-4 text-neutral-400 group-hover:text-lime-400 transition-all duration-150 group-hover:-translate-y-6 group-hover:translate-x-6" />
                    <ArrowUpRight className="absolute w-4 h-4 text-lime-400 -translate-x-6 translate-y-6 transition-all duration-150 group-hover:translate-x-0 group-hover:translate-y-0" />
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
