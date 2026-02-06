import { ProjectShowcase } from '@/components/projects'
import { Section } from '@/components/ui/section'
import { Heading } from '@/components/ui/heading'
import { FolderGit2 } from 'lucide-react'

type Props = {
	visibleRowCount?: number
}

export function ProjectsView({ visibleRowCount = 6 }: Props) {
	return (
		<Section noPadding contentPadding={false}>
			<Heading title="Projects & Work" icon={FolderGit2} />
			<div className="mx-auto max-w-3xl">
				<ProjectShowcase visibleRowCount={visibleRowCount} />
			</div>
		</Section>
	)
}
