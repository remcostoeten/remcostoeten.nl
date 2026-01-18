import { getProjects, getSettings } from "@/modules/projects/server/queries"
import { ProjectsAdmin } from "@/modules/projects/admin/projects-admin"

export default async function AdminProjectsPage() {
    const projects = await getProjects(true)
    const settings = await getSettings()

    return (
        <div className="p-6">
            <ProjectsAdmin initialProjects={projects} initialSettings={settings} />
        </div>
    )
}
