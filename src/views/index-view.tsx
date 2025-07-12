'use client'

import type React from 'react'

import { useState, useEffect } from 'react'

import { ProjectCard } from '@/components/project-card'
import { ContactForm } from '@/components/contact-form'

function getFormattedTime() {
		const now = new Date()
		const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
		const utcPlus1 = new Date(utcTime + 1 * 3600000)
		return utcPlus1.toTimeString().split(' ')[0]
	}

export const IndexView = () => {
	const [currentTime, setCurrentTime] = useState<string>(getFormattedTime())
	const [isContactHovered, setIsContactHovered] = useState(false)
	const [shouldOpenAbove, setShouldOpenAbove] = useState(false)

	useEffect(() => {
		const updateTime = () => {
			setCurrentTime(getFormattedTime())
		}

		const interval = setInterval(updateTime, 1000)

		return () => clearInterval(interval)
	}, [])

	const handleContactHover = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const spaceBelow = viewportHeight - rect.bottom
		const formHeight = 400 // Approximate form height

		setShouldOpenAbove(spaceBelow < formHeight)
		setIsContactHovered(true)
	}

	return (
		<div className='min-h-screen bg-background text-foreground flex items-center justify-center px-6'>
			<div className='max-w-2xl w-full space-y-8'>
				{/* Main heading */}
				<h1 className='text-xl font-medium text-foreground'>
					I craft digital experiences.
				</h1>

				{/* Introduction paragraph */}
				<p className='text-foreground leading-relaxed text-base'>
					With extensive experience in{' '}
					<span
						className='font-medium px-1 py-0.5 rounded'
						style={{
							backgroundColor:
								'hsl(var(--highlight-frontend) / 0.2)',
							color: 'hsl(var(--highlight-frontend))'
						}}
					>
						TypeScript and React & Next.js
					</span>
					, I specialize in building scalable web applications, from
					Magento shops to modern SaaS platforms. Currently working on
					an{' '}
					<span
						className='font-medium px-1 py-0.5 rounded'
						style={{
							backgroundColor:
								'hsl(var(--highlight-product) / 0.2)',
							color: 'hsl(var(--highlight-product))'
						}}
					>
						LMS system for Dutch MBO students
					</span>
					.
				</p>

				{/* Projects paragraph */}
				<div className='text-foreground leading-relaxed text-base'>
					Recently I've been building{' '}
					<ProjectCard
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
					/>{' '}
					and{' '}
					<ProjectCard
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
					/>{' '}
					and various{' '}
					<span
						className='font-medium px-1 py-0.5 rounded'
						style={{
							backgroundColor:
								'hsl(var(--highlight-frontend) / 0.2)',
							color: 'hsl(var(--highlight-frontend))'
						}}
					>
						CLI tools & automation scripts
					</span>
					. More projects and experiments can be found on{' '}
					<a
						href='https://github.com/remcostoeten'
						target='_blank'
						rel='noopener noreferrer'
						className='text-accent hover:underline font-medium'
					>
						GitHub ↗
					</a>
					.
				</div>

				{/* Contact paragraph */}
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
						onMouseLeave={() => setIsContactHovered(false)}
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

				{/* Timezone paragraph */}
				<p className='text-foreground leading-relaxed text-base'>
					My current timezone is{' '}
				<span className='font-medium'>CET</span> which includes
				countries like{' '}
				<span className='font-medium'>Netherlands</span>,{' '}
				<span className='font-medium'>Germany</span> and{' '}
				<span className='font-medium'>France</span>. Right now it is{' '}
				<span className='font-medium font-mono' style={{ minWidth: '8ch', display: 'inline-block' }}>{currentTime || '00:00:00'}</span>.
				</p>
			</div>
		</div>
	)
}
