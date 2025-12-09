import { BlogPosts } from '@/components/posts'
import { Intro } from '@/components/intro'
import { ActivitySection } from '@/components/ActivitySection'
import WorkExperienceDemo from '@/components/work-experience-demo'

export default function Page() {
  return (
    <div className="space-y-6">
      <Intro />

      <div className="space-y-4">
        <ActivitySection />
        <WorkExperienceDemo />
        <BlogPosts />
      </div>
    </div>
  )
}
