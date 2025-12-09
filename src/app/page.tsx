import { BlogPosts } from '@/components/posts'
import { Intro } from '@/components/intro'
import { ActivitySection } from '@/components/ActivitySection'
import WorkExperienceDemo from '@/components/work-experience-demo'

export default function Page() {
  return (
    <div className="space-y-6">
      {/* Intro - no border, just content */}
      <Intro />

      {/* Main content sections with consistent bordered design */}
      <div className="space-y-4">
        <ActivitySection />
        <WorkExperienceDemo />
        <BlogPosts />
      </div>
    </div>
  )
}
