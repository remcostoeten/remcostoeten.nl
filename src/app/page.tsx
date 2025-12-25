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
            <div className="px-4 md:px-5 pt-4 space-y-4">
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
                My go-to technologies for building modern web applications. From React and TypeScript on the frontend to Node.js and PostgreSQL on the backend—these are the tools I reach for daily.
              </p>
              <TechStackCloud />
            </div>
          </Section>

          <BlogPosts />
        </div>
      </div>
    </>
  )
}

