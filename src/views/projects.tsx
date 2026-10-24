import { ProjectShowcase } from '@/components/projects'
import { Section } from '@/components/ui/section'

type Props = {
	visibleRowCount?: number
}

export function ProjectsView({ visibleRowCount = 6 }: Props) {
	return (
		<Section title="Projects" noHeaderMargin contentPadding={false}>
			<p className="px-4 pt-4 pb-4 font-mono text-sm leading-relaxed tracking-tight text-muted-foreground/80 md:px-5">
				Things I build in my spare time, mostly tools I wanted for
				myself. Some are polished, some are experiments, and the commit
				activity shows which ones I'm working on right now.
			</p>
			<div className="mx-auto max-w-3xl">
				<ProjectShowcase visibleRowCount={visibleRowCount} />
			</div>
		</Section>
	)
}
