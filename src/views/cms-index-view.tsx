'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { ContactForm } from '@/components/contact-form'
import { NowPlaying } from '@/components/dynamic-data/now-playing'
import { ProjectCard } from '@/components/project-card'
import { FyncGithubDemo } from '@/components/fync-github-demo'
import { CMSStore } from '@/lib/cms-store'
import { ContentSegment, Page } from '@/types/cms'
import { LastCommit } from '@/components/dynamic-data/last-commit'

function getFormattedTime() {
	const now = new Date()
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
	const utcPlus1 = new Date(utcTime + 1 * 3600000)
	return utcPlus1.toTimeString().split(' ')[0]
}

function renderSegment(segment: ContentSegment) {
	switch (segment.type) {
		case 'highlighted':
			return (
				<span key={segment.id} className='font-medium text-accent'>
					{segment.content}
				</span>
			)

		case 'link':
			return (
				<a
					key={segment.id}
					href={segment.data?.url || '#'}
					target='_blank'
					rel='noopener noreferrer'
					className='text-accent hover:underline font-medium'
				>
					{segment.content} ↗
				</a>
			)

		case 'project-card': {
			// For project cards, we need to map them to the actual ProjectCard component
			// This is a simplified approach - you might want to store more project data in the CMS
			const isAuth = segment.content.includes('Authentication')
			const isTurso = segment.content.includes('Turso')

			if (isAuth) {
				return (
					<ProjectCard
						key={segment.id}
						title='Roll Your Own Authentication'
						description='A comprehensive Next.js 15 authentication system showcasing how to implement JWT-based auth without external services like Lucia, NextAuth, or Clerk. Features secure PostgreSQL storage, admin roles, onboarding flows, and more.'
						url='https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication'
						demoUrl='https://ryoa.vercel.app/'
						stars={0}
						branches={34}
						technologies={[
							'Next.js 15',
							'TypeScript',
							'PostgreSQL',
							'JWT',
							'Tailwind CSS'
						]}
						lastUpdated='recently'
						highlights={[
							'JWT authentication without external services',
							'Secure PostgreSQL user storage',
							'Admin role management system',
							'Configurable onboarding flows',
							'Modern Next.js 15 features'
						]}
					/>
				)
			}

			if (isTurso) {
				return (
					<ProjectCard
						key={segment.id}
						title='Turso DB Creator CLI'
						description='A powerful CLI tool for Turso (turso.tech) that automates SQLite database creation and credential management. Automatically copies URLs and auth tokens to clipboard with .env syntax, includes --overwrite flag for seamless credential updates.'
						url='https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials'
						stars={1}
						branches={5}
						technologies={[
							'CLI',
							'Node.js',
							'Turso',
							'SQLite',
							'Shell Scripts'
						]}
						lastUpdated='recently'
						highlights={[
							'One-command database creation',
							'Automatic credential management',
							'Clipboard integration with .env format',
							'Smart credential overwriting',
							'Sub-10 second deployment workflow'
						]}
					/>
				)
			}

			// Fallback for other project cards
			return (
				<span key={segment.id} className='font-medium text-accent'>
					{segment.content}
				</span>
			)
		}

		default:
			return <span key={segment.id}>{segment.content}</span>
	}
}

function getInitialHomeContent(): Page {
	const content = CMSStore.getHomePageContent()
	if (content) {
		return content
	}
	return CMSStore.initializeDefaultHomePage()
}

export function CMSIndexView() {
	const [currentTime, setCurrentTime] = useState<string>(getFormattedTime())
	const [isContactHovered, setIsContactHovered] = useState(false)
	const [shouldOpenAbove, setShouldOpenAbove] = useState(false)
	const [homePageContent, setHomePageContent] = useState<Page>(
		getInitialHomeContent
	)

	useEffect(function setupTimeInterval() {
		function updateTime() {
			setCurrentTime(getFormattedTime())
		}

		const interval = setInterval(updateTime, 1000)
		return function cleanup() {
			clearInterval(interval)
		}
	}, [])

	useEffect(function setupHomeContentListener() {
		function loadHomeContent() {
			const content = CMSStore.getHomePageContent()
			if (content) {
				setHomePageContent(content)
			} else {
				const defaultHome = CMSStore.initializeDefaultHomePage()
				setHomePageContent(defaultHome)
			}
		}

		function handleStorageChange() {
			loadHomeContent()
		}

		window.addEventListener('storage', handleStorageChange)
		return function cleanup() {
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [])

	function handleContactHover(e: React.MouseEvent<HTMLDivElement>) {
		const rect = e.currentTarget.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const spaceBelow = viewportHeight - rect.bottom
		const formHeight = 400

		setShouldOpenAbove(spaceBelow < formHeight)
		setIsContactHovered(true)
	}

	// If no content is loaded yet, show loading or fallback
	if (!homePageContent) {
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

	return (
		<div className='min-h-screen bg-background text-foreground flex items-center justify-center px-6'>
			<div className='max-w-2xl w-full space-y-8'>
				{/* Render CMS content blocks */}
				{homePageContent.blocks
					.sort(function sortByOrder(a, b) {
						return a.order - b.order
					})
					.map(function renderBlock(block) {
						const content = block.content.map(renderSegment)

						if (block.type === 'heading') {
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
							<div
								key={block.id}
								className='text-foreground leading-relaxed text-base'
							>
								{content}
							</div>
						)
					})}

				{/* Static contact and timezone info - these could also be moved to CMS later */}
				<p className='text-foreground leading-relaxed text-base'>
					Find me on{' '}
					<a
						href='https://github.com/remcostoeten'
						target='_blank'
						rel='noopener noreferrer'
						className='text-accent hover:underline font-medium'
					>
						GitHub ↗
					</a>{' '}
					and{' '}
					<a
						href='https://nl.linkedin.com/in/remco-stoeten'
						target='_blank'
						rel='noopener noreferrer'
						className='text-accent hover:underline font-medium'
					>
						LinkedIn ↗
					</a>{' '}
					or contact me via{' '}
					<span
						className='relative inline-block'
						onMouseEnter={handleContactHover}
						onMouseLeave={function handleContactLeave() {
							setIsContactHovered(false)
						}}
					>
						<button className='text-accent font-medium border-b border-dotted border-accent/30 hover:border-accent/60'>
							Email ↗
						</button>
						<ContactForm
							isVisible={isContactHovered}
							openAbove={shouldOpenAbove}
						/>
					</span>{' '}
					or check out my{' '}
					<a
						href='https://remcostoeten.nl'
						target='_blank'
						rel='noopener noreferrer'
						className='text-accent hover:underline font-medium'
					>
						website ↗
					</a>
					.
				</p>

				<p className='text-foreground leading-relaxed text-base'>
					My current timezone is{' '}
					<span className='font-medium'>CET</span> which includes
					countries like{' '}
					<span className='font-medium'>Netherlands</span>,{' '}
					<span className='font-medium'>Germany</span> and{' '}
					<span className='font-medium'>France</span>. Right now it is{' '}
					<span
						className='font-medium font-mono'
						style={{ minWidth: '8ch', display: 'inline-block' }}
					>
						{currentTime || '00:00:00'}
					</span>
					.
				</p>

				{/* Last commit and music information */}
				<div className='pt-4 border-t border-border/20 space-y-2'>
					<LastCommit />
					<NowPlaying />
				</div>

				{/* GitHub Activity Demo */}
				<div className='pt-8 border-t border-border/20'>
					<FyncGithubDemo />
				</div>
			</div>
		</div>
	)
}
