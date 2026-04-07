import { ProjectShowcase } from '@/components/projects'
import { Section } from '@/components/ui/section'

type Props = {
	visibleRowCount?: number
}

export function ProjectsView({ visibleRowCount = 6 }: Props) {
	return (
		<Section noPadding contentPadding={false}>
			<div className="mx-auto max-w-3xl">
				<ProjectShowcase visibleRowCount={visibleRowCount} />
			</div>
		</Section>
	)
}
