import Link from 'next/link'
import { getAllBlogPosts } from '@/modules/blog/queries'
import { formatDate } from '@/modules/blog/utils'
import { ArrowRight } from 'lucide-react'

export function WritingSection() {
    const allPosts = getAllBlogPosts()
        .sort((a, b) => {
            if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
                return -1
            }
            return 1
        })
        .slice(0, 5) // Show first 5 posts

    return (
        <main className="px-6 py-12 md:px-12 md:py-24 max-w-3xl mx-auto w-full flex-grow">
            <header className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Writing</h1>
                <p className="text-muted-foreground">
                    Thoughts on software engineering, design, and over-engineering personal projects.
                </p>
            </header>

            <div>
                {allPosts.map(post => (
                    <Link
                        key={post.slug}
                        className="flex flex-col space-y-1 mb-4"
                        href={`/blog/${post.slug}`}
                    >
                        <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
                            <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                                {formatDate(post.metadata.publishedAt, false)}
                            </p>
                            <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                                {post.metadata.title}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div 
                className="mt-8 flex justify-end animate-enter"
                style={{ animationDelay: '400ms' }}
            >
                <Link
                    href="/blog"
                    className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    View all posts
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </main>
    )
}

