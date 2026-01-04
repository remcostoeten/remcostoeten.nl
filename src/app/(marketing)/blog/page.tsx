import { BlogPosts } from '@/components/blog/posts'
import { TopicsSidebar } from '@/components/blog/topics-sidebar'

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <>
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
