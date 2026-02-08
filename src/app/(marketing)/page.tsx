import { Intro } from '@/components/home/hero'
import { Section } from '@/components/ui/section'
import { homeMetadata } from '@/core/metadata'
import nextDynamic from 'next/dynamic'
import { DeferredRender } from '@/components/ui/deferred-render'
import { ProjectShowcaseSkeleton } from '@/components/projects/components/project-showcase-skeleton'
import {
	ActivitySectionSkeleton,
	TechStackSkeleton,
	WorkExperienceSkeleton,
	BlogPostsSkeleton
} from '@/components/ui/skeletons/section-skeletons'

const ActivitySection = nextDynamic(
	() =>
		import('@/components/landing/activity/section').then(m => ({
			default: m.ActivitySection
		})),
	{ loading: () => <ActivitySectionSkeleton />, ssr: false }
)

const TechStackCloud = nextDynamic(
	() =>
		import('@/components/landing/tech-stack-cloud').then(m => ({
			default: m.TechStackCloud
		})),
	{ loading: () => <TechStackSkeleton /> }
)

const WorkExperienceSection = nextDynamic(
	() =>
		import('@/components/home/work-experience-section').then(m => ({
			default: m.WorkExperienceSection
		})),
	{ loading: () => <WorkExperienceSkeleton /> }
)

const BlogPosts = nextDynamic(
	() =>
		import('@/components/blog/posts').then(m => ({ default: m.BlogPosts })),
	{ loading: () => <BlogPostsSkeleton /> }
)

const ProjectShowcase = nextDynamic(
	() =>
		import('@/components/projects').then(m => ({
			default: m.ProjectShowcase
		})),
	{
		loading: () => <ProjectShowcaseSkeleton visibleRowCount={6} />,
		ssr: false
	}
)

const Playground = nextDynamic(
	() =>
		import('@/components/landing/playground').then(m => ({
			default: m.Playground
		})),
	{ loading: () => <div className="h-40 animate-pulse bg-muted/20" />, ssr: false }
)

export const revalidate = 60

export { homeMetadata as metadata }

export default function Page() {
	return (
		<>
			<div className="space-y-6">
				<Intro />

				<div className="space-y-4">
					<Section
						title="Tech Stack"
						noHeaderMargin
						className="!mb-0 border-b-0"
					>
						<div className="pt-4 space-y-4">
							<p className="text-sm px-4 text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
								My go-to technologies for building modern web
								applications. From React and TypeScript on
								frontend to Node.js and PostgreSQL on
								backend—these are the tools I reach for daily.
							</p>
							<TechStackCloud />
						</div>
					</Section>

					<WorkExperienceSection />

					<DeferredRender
						rootMargin="500px 0px"
						fallback={<ActivitySectionSkeleton />}
					>
						<ActivitySection />
					</DeferredRender>

					<DeferredRender
						rootMargin="500px 0px"
						fallback={
							<Section title="Projects" noHeaderMargin>
								<ProjectShowcaseSkeleton visibleRowCount={6} />
							</Section>
						}
					>
						<Section title="Projects" noHeaderMargin>
							<ProjectShowcase />
						</Section>
					</DeferredRender>

					<DeferredRender
						rootMargin="400px 0px"
						fallback={
							<div className="h-40 animate-pulse bg-muted/20" />
						}
					>
						<Playground />
					</DeferredRender>

					<BlogPosts checkAdmin={false} />
				</div>
			</div>
		</>
	)
}
