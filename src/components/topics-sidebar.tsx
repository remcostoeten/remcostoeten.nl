import Link from 'next/link'
import { Hash } from 'lucide-react'
import { getAllCategories } from 'src/utils/utils'

export function TopicsSidebar() {
    const categories = getAllCategories()

    return (
        <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-8">
                <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-4">
                    Topics
                </h2>
                <ul className="space-y-1">
                    {categories.map((category) => (
                        <li key={category.name}>
                            <Link
                                href={`/topics/${category.name.toLowerCase()}`}
                                className="group flex items-center justify-between py-1.5 text-sm text-neutral-400 hover:text-lime-400 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Hash className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <span className="truncate">{category.name}</span>
                                </span>
                                <span className="text-xs text-neutral-600 tabular-nums">
                                    {category.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
}
