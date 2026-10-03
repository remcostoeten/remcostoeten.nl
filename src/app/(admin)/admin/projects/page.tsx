import { ProjectsAdmin } from '@/components/projects/admin/projects-admin'
import { getProjects, getSettings } from '@/components/projects/server/queries'
import { connection } from 'next/server'

export default async function AdminProjectsPage() {
	await connection()
	const projects = await getProjects(true)
	const settings = await getSettings()

	return (
		<div className="space-y-6">
			<ProjectsAdmin
				initialProjects={projects}
				initialSettings={settings}
			/>
		</div>
	)
}
