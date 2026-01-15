import { BlogPosts } from '@/components/blog/posts'
import { TopicsSidebar } from '@/components/blog/topics-sidebar'
import { BreadcrumbStructuredData } from '@/components/seo/structured-data'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog',
  description: 'Articles about frontend development, React, TypeScript, Next.js, and software engineering. Thoughts, tutorials, and insights from a Dutch software engineer.',
}

export default function Page() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
      />
      <TopicsSidebar />
      <section className="space-y-6 sm:space-y-8">
        <div className="pt-1 sm:pt-2 md:pt-4">
          <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl tracking-tight">My Blog</h1>
        </div>
        <BlogPosts />
      </section>
    </>
  )
}
