import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { IntroAdmin } from '@/components/home/intro-admin'
import { getIntro } from '@/components/home/intro-queries'
import { connection } from 'next/server'

export default async function AdminIntroPage() {
	await connection()
	const intro = await getIntro()
	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Intro"
				description="Edit the name, role and bio at the top of the home page."
			/>
			<IntroAdmin initialValue={intro} />
		</div>
	)
}
