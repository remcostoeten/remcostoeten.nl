import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { ActivitySection } from '@/components/landing/activity/section';
import { TechStackCloud } from '@/components/landing/tech-stack-cloud';
import { Section } from '@/components/ui/section';
import { homeMetadata } from '@/core/metadata'
import nextDynamic from 'next/dynamic'

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
          <Section title="Tech Stack" noHeaderMargin>
            <div className="px-4 md:px-5 pt-4">
              <TechStackCloud />
            </div>
          </Section>

          <BlogPosts />
        </div>
      </div>
    </>
  )
}

