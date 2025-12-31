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
      <section>
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Blog</h1>
        <BlogPosts />
      </section>
    </>
  )
}
