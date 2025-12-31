import { BlogPosts } from '@/components/blog/posts';
import { Intro } from '@/components/home/hero';
import { Section } from '@/components/ui/section';
import { homeMetadata } from '@/core/metadata'
import nextDynamic from 'next/dynamic'
import { TechStackSkeleton, ActivitySectionSkeleton } from '@/components/ui/skeletons/section-skeletons'

const ActivitySection = nextDynamic(
  () => import('@/components/landing/activity/section').then(m => ({ default: m.ActivitySection })),
  { loading: () => <ActivitySectionSkeleton /> }
)

const TechStackCloud = nextDynamic(
  () => import('@/components/landing/tech-stack-cloud').then(m => ({ default: m.TechStackCloud })),
  { loading: () => <TechStackSkeleton /> }
)

const WorkExperienceDemo = nextDynamic(() => import('@/components/home/work-experience'), {
  loading: () => <div className="h-[400px] w-full bg-muted/10 animate-pulse rounded-lg" />
})

export const revalidate = 60

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

          <Section title="Tech Stack" noHeaderMargin>
            <div className="py-4 space-y-4">
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
