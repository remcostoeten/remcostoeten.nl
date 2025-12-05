import { BlogPosts } from 'src/components/posts'
import { Intro } from 'src/components/intro'
import { ActivitySection } from 'src/components/ActivitySection'

export default function Page() {
  return (
    <section className="space-y-8" style={{ contain: 'layout' }}>
      <div style={{ contain: 'layout style' }}>
        <Intro />
      </div>
      <div style={{ contain: 'layout style' }}>
        <ActivitySection />
      </div>
      <div className="my-4" style={{ contain: 'layout' }}>
        <BlogPosts />
      </div>
    </section>
  )
}
