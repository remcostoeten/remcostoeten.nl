'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatTimeAgo } from '@/lib/utils'
import { TextSkeleton } from '../ui/text-skeleton'

type TProps = {
	repo?: string
	refreshInterval?: number
}

type TCommitData = {
	sha: string
	date: string
	html_url: string
}

type TAPIState = {
	data: TCommitData | null
	loading: boolean
	error: string | null
}

export function LastCommit({
	repo = 'remcostoeten/remcostoeten.nl',
	refreshInterval = 60000
}: TProps) {
	const [state, setState] = useState<TAPIState>({
		data: null,
		loading: true,
		error: null
	})

	const fetchData = useCallback(async () => {
		try {
			setState(prev => ({ ...prev, loading: true, error: null }))

			const response = await fetch(`/api/github/commits?repo=${repo}`)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()

			setState({
				data,
				loading: false,
				error: null
			})
		} catch (error) {
			setState({
				data: null,
				loading: false,
				error:
					error instanceof Error ? error.message : 'An error occurred'
			})
		}
	}, [repo])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	useEffect(() => {
		if (!refreshInterval) return

		const interval = setInterval(fetchData, refreshInterval)
		return () => clearInterval(interval)
	}, [fetchData, refreshInterval])

	if (state.error) {
		return (
			<div className='text-base text-foreground leading-relaxed'>
				Error: {state.error}
			</div>
		)
	}

	if (!state.data && !state.loading) {
		return (
			<div className='text-base text-foreground leading-relaxed'>
				No recent commits found
			</div>
		)
	}

	const commitHash = state.data?.sha?.substring(0, 7) || 'latest'
	const timeAgo = state.data?.date
		? formatTimeAgo(new Date(state.data.date))
		: ''

	return (
		<div className='text-base text-foreground leading-relaxed'>
			The last commit I've pushed was{' '}
			<AnimatePresence mode='wait'>
				{state.loading ? (
					<motion.span
						key='hash-skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className='inline-block'
					>
						<TextSkeleton
							width='56px'
							height='1rem'
							className='inline-block'
						/>
					</motion.span>
				) : (
					<motion.a
						key='hash-link'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						href={state.data?.html_url}
						target='_blank'
						rel='noopener noreferrer'
						className='text-accent hover:underline font-medium inline-block'
						style={{ width: '56px' }}
					>
						{commitHash}
					</motion.a>
				)}
			</AnimatePresence>{' '}
			<AnimatePresence mode='wait'>
				{state.loading ? (
					<motion.span
						key='time-skeleton'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className='inline-block'
					>
						<TextSkeleton
							width='70px'
							height='1rem'
							className='inline-block'
						/>
					</motion.span>
				) : (
					<motion.span
						key='time-text'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className='inline-block'
						style={{ width: '70px' }}
					>
						{timeAgo}
					</motion.span>
				)}
			</AnimatePresence>
			{' ago'}
		</div>
	)
}
