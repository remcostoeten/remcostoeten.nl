'use client'

import { Component, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type PanelErrorBoundaryProps = {
	title: string
	children: ReactNode
}

type PanelErrorBoundaryState = {
	error: Error | null
}

function PanelErrorFallback({
	title,
	error,
	onRetry
}: {
	title: string
	error: Error
	onRetry: () => void
}) {
	const router = useRouter()

	function handleRetry() {
		startTransition(() => {
			router.refresh()
			onRetry()
		})
	}

	return (
		<section className="admin-panel" role="alert">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">{title}</h2>
			</div>
			<div className="flex flex-col items-start gap-4 px-5 pb-5">
				<p className="text-[13px] text-muted-foreground">
					{error.message || 'This panel failed to load.'}
				</p>
				<button
					type="button"
					onClick={handleRetry}
					className="admin-btn"
				>
					Try again
				</button>
			</div>
		</section>
	)
}

export class PanelErrorBoundary extends Component<
	PanelErrorBoundaryProps,
	PanelErrorBoundaryState
> {
	state: PanelErrorBoundaryState = { error: null }

	static getDerivedStateFromError(error: Error): PanelErrorBoundaryState {
		return { error }
	}

	componentDidCatch(error: Error) {
		console.error(`[admin panel: ${this.props.title}]`, error)
	}

	render() {
		if (this.state.error) {
			return (
				<PanelErrorFallback
					title={this.props.title}
					error={this.state.error}
					onRetry={() => this.setState({ error: null })}
				/>
			)
		}

		return this.props.children
	}
}
