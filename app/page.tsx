import { BlogPosts } from 'app/components/posts'
import { Intro } from 'app/components/intro'
import { ActivitySection } from 'app/components/ActivitySection'

export default function Page() {
  return (
    <section className="space-y-12">
      <Intro />
      <ActivitySection />
  
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
