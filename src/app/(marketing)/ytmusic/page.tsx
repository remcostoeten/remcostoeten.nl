import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { createPageMetadata } from '@/core/metadata/base'
import { YTMusicDiagnostics } from '@/features/ytmusic/components/ytmusic-diagnostics'
import { getYTMusicResult } from '@/server/ytmusic'

export const metadata: Metadata = createPageMetadata({
	title: 'YouTube Music signal check',
	description:
		'Live diagnostics for the YouTube Music listening-history integration.',
	canonical: '/ytmusic',
	noIndex: true
})

export default function YTMusicPage() {
	return (
		<Suspense fallback={<DiagnosticsSkeleton />}>
			<LiveDiagnostics />
		</Suspense>
	)
}

async function LiveDiagnostics() {
	await connection()
	const initialResult = await getYTMusicResult(20)
	return <YTMusicDiagnostics initialResult={initialResult} />
}

function DiagnosticsSkeleton() {
	return (
		<div className="px-4 pb-16 md:px-5" aria-busy="true">
			<div className="h-52 animate-pulse border-y border-border bg-muted/30 motion-reduce:animate-none" />
			<div className="mt-6 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
				{Array.from({ length: 4 }, (_, index) => (
					<div key={index} className="h-24 bg-background" />
				))}
			</div>
		</div>
	)
}
