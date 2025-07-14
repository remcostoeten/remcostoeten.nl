'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { ContactForm } from '@/components/contact-form'
import { FyncGithubDemo } from '@/components/fync-github-demo'
import { TContentBlock, TPageContent, TContentSegment } from '@/lib/cms/types'
import { renderSegment } from '@/lib/cms/renderSegment'

function getFormattedTime() {
	const now = new Date()
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
	const utcPlus1 = new Date(utcTime + 1 * 3600000)
	return utcPlus1.toTimeString().split(' ')[0]
}

async function fetchHomePageContent(): Promise<TPageContent | null> {
	try {
		const response = await fetch('/api/cms/home')
		if (!response.ok) {
			throw new Error('Failed to fetch home page content')
		}
		const result = await response.json()
		if (result.success && result.data) {
			return result.data
		}
		return null
	} catch (error) {
		console.error('Error fetching home page content:', error)
		return null
	}
}

export function CMSIndexView() {
	const [currentTime, setCurrentTime] = useState<string>(getFormattedTime())
	const [isContactHovered, setIsContactHovered] = useState(false)
	const [shouldOpenAbove, setShouldOpenAbove] = useState(false)
	const [homePageContent, setHomePageContent] = useState<TPageContent | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(function setupTimeInterval() {
		function updateTime() {
			setCurrentTime(getFormattedTime())
		}

		const interval = setInterval(updateTime, 1000)
		return function cleanup() {
			clearInterval(interval)
		}
	}, [])

	useEffect(function loadHomePageContent() {
		async function loadContent() {
			setIsLoading(true)
			setError(null)
			
			try {
				const content = await fetchHomePageContent()
				if (content) {
					setHomePageContent(content)
				} else {
					setError('No content available')
				}
			} catch (err) {
				setError('Failed to load content')
				console.error('Error loading home page content:', err)
			} finally {
				setIsLoading(false)
			}
		}

		loadContent()
	}, [])

	function handleContactHover(e: React.MouseEvent<HTMLDivElement>) {
		const rect = e.currentTarget.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const spaceBelow = viewportHeight - rect.bottom
		const formHeight = 400

		setShouldOpenAbove(spaceBelow < formHeight)
		setIsContactHovered(true)
	}

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-background text-foreground flex items-center justify-center px-6'>
				<div className='max-w-2xl w-full space-y-8'>
					<h1 className='text-xl font-medium text-foreground'>
						Loading...
					</h1>
				</div>
			</div>
		)
	}

	// Error state
	if (error || !homePageContent) {
		return (
			<div className='min-h-screen bg-background text-foreground flex items-center justify-center px-6'>
				<div className='max-w-2xl w-full space-y-8'>
					<h1 className='text-xl font-medium text-foreground'>
						Error loading content
					</h1>
					<p className='text-muted-foreground'>
						{error || 'Content not available'}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-background text-foreground flex items-center justify-center px-6'>
			<div className='max-w-2xl w-full space-y-8'>
				{/* Render CMS content blocks */}
				{homePageContent.blocks
					.sort(function sortByOrder(a, b) {
						return a.order - b.order
					})
					.map(function renderBlock(block) {
						const content = block.segments.map(renderSegment)

						if (block.blockType === 'heading') {
							return (
								<h1
									key={block.id}
									className='text-xl font-medium text-foreground'
								>
									{content}
								</h1>
							)
						}

						return (
							<p
								key={block.id}
								className='text-foreground leading-relaxed text-base'
							>
								{content}
							</p>
						)
					})}
			</div>
		</div>
	)
}
