import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { ActivitySection } from '@/components/activity/section';
import { TechStackCloud } from '@/components/ui/tech-stack-cloud';
import { homeMetadata } from '@/core/metadata'
import nextDynamic from 'next/dynamic'

// Lazy load non-critical components
const WorkExperienceDemo = nextDynamic(() => import('@/components/home/work-experience'), {
  loading: () => null // Don't show loading state - appears instantly usually
})

export const dynamic = 'force-dynamic'

export { homeMetadata as metadata }

export default function Page() {
  return (
    <>
      <div className="space-y-6">
        <Intro />

        <div className="space-y-4">
          <div>
            <ActivitySection />
            <WorkExperienceDemo />
          </div>

          {/* Tech Stack - Above Blog */}
          <div className="px-4 md:px-0 py-8">
            <h3 className="text-center font-medium text-lg text-muted-foreground tracking-tight md:text-xl mb-6">
              Tech stack I work with
            </h3>
            <TechStackCloud />
          </div>

          <BlogPosts />
        </div>
      </div>
    </>
  )
}
