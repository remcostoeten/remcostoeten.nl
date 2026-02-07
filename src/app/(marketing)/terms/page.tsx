import { Suspense } from 'react'
import TermsContent from './terms-content'

export const metadata = {
	title: 'Terms of Service',
	description:
		'Terms of service for remcostoeten.nl - Rules and guidelines for using this website.'
}

export default function TermsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TermsContent />
		</Suspense>
	)
}
