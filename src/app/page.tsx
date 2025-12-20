import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { ActivitySection } from '@/components/activity/section';
import WorkExperienceDemo from '@/components/home/work-experience';
import { homeMetadata } from '@/core/metadata'

export const dynamic = 'force-dynamic'

export { homeMetadata as metadata }

export default function Page() {
  return (
    <div className="space-y-6">
      <Intro />

      <div className="space-y-4">
        <div>
          <ActivitySection />
          <WorkExperienceDemo />
        </div>
        <div className="screen-border" />
        <BlogPosts />
      </div>
    </div>
  )
}
