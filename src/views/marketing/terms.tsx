import { Suspense } from 'react'
import TermsContent from './terms-content'

export function TermsView() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TermsContent />
		</Suspense>
	)
}
