import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { ActivitySectionWrapper } from '@/components/activity/section-wrapper';
import WorkExperienceDemo from '@/components/home/work-experience';
import { homeMetadata } from '@/services/metadata'

export { homeMetadata as metadata }

export default function Page() {
  return (
    <div className="space-y-6">
      <Intro />

      <div className="space-y-4">
        <ActivitySectionWrapper />
        <WorkExperienceDemo />
        <div className="screen-border" />
        <BlogPosts />
      </div>
    </div>
  )
}
