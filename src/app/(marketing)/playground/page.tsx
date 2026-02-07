import { Metadata } from 'next'
import { Suspense } from 'react'
import { PlaygroundView } from '@/views/playground-view'

export const metadata: Metadata = {
	title: 'Playground',
	description:
		'Components, utilities, and experiments. Small artifacts that do not warrant their own repositories.'
}

export default function PlaygroundPage() {
	return (
		<Suspense fallback={null}>
			<PlaygroundView />
		</Suspense>
	)
}
