import { Intro } from '@/components/home/hero'
import { Section } from '@/components/ui/section'
import nextDynamic from 'next/dynamic'
import { HomeBlogPosts } from '@/components/blog/home-blog-posts'
import {
	TechStackSkeleton,
	WorkExperienceSkeleton
} from '@/components/ui/skeletons/section-skeletons'
import { ProjectsView } from '../projects'

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

const ActivitySectionClient = nextDynamic(
	() =>
		import('@/components/landing/activity/activity-section-client').then(
			m => ({
				default: m.ActivitySectionClient
			})
		),
	{ loading: () => <div className="h-48 animate-pulse bg-muted/20" /> }
)

export function HomeView() {
	return (
		<>
			<div className="space-y-6">
				<Intro />

				<div className="space-y-4">
					<Section
						animatedStripes
						title="Tech Stack"
						noHeaderMargin
						className="!mb-0 border-b-0"
					>
						<div className="pt-4 space-y-4">
							<p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight px-4 md:px-5">
								These are my absolute go-to tools for building
								scalable, high-performance web applications.
								Beyond my daily drivers, I am constantly
								exploring the broader ecosystem: engineering
								blazing-fast CLIs with Go, diving into systems
								programming with Rust, spinning up edge-ready
								backends with Bun, or streamlining workflows
								through Python and Bash automation.
							</p>
							<TechStackCloud />
						</div>
					</Section>

					<WorkExperienceSection />
					<ProjectsView />
					<ActivitySectionClient />

					<HomeBlogPosts />
				</div>
			</div>
		</>
	)
}
