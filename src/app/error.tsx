'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RotateCcw } from 'lucide-react'

type Props = {
	error: Error & { digest?: string }
	reset: () => void
}

export default function RootError({ error, reset }: Props) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
			<div className="max-w-lg space-y-6">
				<div className="space-y-2">
					<h1 className="text-6xl font-bold tracking-tighter text-muted-foreground/20 md:text-8xl">
						500
					</h1>
					<div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-primary to-primary/50" />
				</div>

				<div className="space-y-4">
					<h2 className="text-2xl font-semibold tracking-tight">
						Something went wrong
					</h2>
					<p className="leading-relaxed text-muted-foreground">
						This page hit an error while loading. You can retry, or
						go back to the homepage.
					</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground/70">
							Reference {error.digest}
						</p>
					)}
				</div>

				<div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
					<button
						type="button"
						onClick={() => reset()}
						className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						<RotateCcw className="h-4 w-4" />
						Try again
					</button>
					<Link
						href="/"
						className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-4 py-2 font-medium transition-colors hover:bg-muted/50"
					>
						<Home className="h-4 w-4" />
						Back to Home
					</Link>
				</div>
			</div>
		</section>
	)
}
