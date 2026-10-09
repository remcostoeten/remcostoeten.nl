import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { WorkExperienceAdmin } from '@/components/home/work-experience-admin'
import { getWorkExperiences } from '@/components/home/work-experience-queries'
import { connection } from 'next/server'

export default async function AdminExperiencePage() {
	await connection()
	const experiences = await getWorkExperiences()
	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Work experience"
				description="Manage the entries shown on the home page."
			/>
			<WorkExperienceAdmin
				initialValue={JSON.stringify(experiences, null, 2)}
			/>
		</div>
	)
}
