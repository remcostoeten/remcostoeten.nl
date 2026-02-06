import { ProjectsAdmin } from '@/components/projects/admin/projects-admin'
import { getProjects, getSettings } from '@/components/projects/server/queries'

export default async function AdminProjectsPage() {
	const projects = await getProjects(true)
	const settings = await getSettings()

	return (
		<div className="p-6">
			<ProjectsAdmin
				initialProjects={projects}
				initialSettings={settings}
			/>
		</div>
	)
}
