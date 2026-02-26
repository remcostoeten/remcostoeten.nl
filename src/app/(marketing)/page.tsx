import { Intro } from '@/components/home/hero';
import { Section } from '@/components/ui/section';
import { homeMetadata } from '@/core/metadata'
import nextDynamic from 'next/dynamic'
import {
  ActivitySectionSkeleton,
  TechStackSkeleton,
  WorkExperienceSkeleton,
  BlogPostsSkeleton
} from '@/components/ui/skeletons/section-skeletons'

const ActivitySection = nextDynamic(
  () => import('@/components/landing/activity/section').then(m => ({ default: m.ActivitySection })),
  { loading: () => <ActivitySectionSkeleton /> }
)

const TechStackCloud = nextDynamic(
  () => import('@/components/landing/tech-stack-cloud').then(m => ({ default: m.TechStackCloud })),
  { loading: () => <TechStackSkeleton /> }
)



const WorkExperienceSection = nextDynamic(
  () => import('@/components/home/work-experience-section').then(m => ({ default: m.WorkExperienceSection })),
  { loading: () => <WorkExperienceSkeleton /> }
)

const BlogPosts = nextDynamic(
  () => import('@/components/blog/posts').then(m => ({ default: m.BlogPosts })),
  { loading: () => <BlogPostsSkeleton /> }
)

const ProjectShowcase = nextDynamic(
  () => import('@/components/projects').then(m => ({ default: m.ProjectShowcase })),
  { loading: () => <div className="h-64 animate-pulse bg-muted/20" /> }
)

export const revalidate = 60
export const dynamic = 'force-dynamic'

export { homeMetadata as metadata }

export default function Page() {
  return (
    <>
      <div className="space-y-6">
        <Intro />

        <div className="space-y-4">
          <Section title="Tech Stack" noHeaderMargin className='!mb-0 border-b-0'>
            <div className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight px-4 md:px-5">
                These technologies are my daily drivers but certainly not exclusive. Aspiring full stack I've been exploring lower level languages like Rust for native development, golang for cli's and cutting-edge back-end frameworks like ElysiaJs.
              </p>
              <TechStackCloud />
            </div>
          </Section>

          <WorkExperienceSection />

          <ActivitySection />

          <Section title="Projects" noHeaderMargin>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight px-4 md:px-5">
                Side projects, experiments, and tools I build because I want to scratch an itch or learn something new. Some are production-ready, some are half-cooked, all of them moved the needle.
              </p>
              <ProjectShowcase />
            </div>
          </Section>

          <BlogPosts />
        </div>
      </div>
    </>
  )
}
