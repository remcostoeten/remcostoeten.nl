import { Suspense } from 'react'
import PrivacyContent from './privacy-content'

export function PrivacyView() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PrivacyContent />
		</Suspense>
	)
}
