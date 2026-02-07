import type { IProject } from './types'

export const featuredProjects: IProject[] = [
	{
		name: 'Skriuw',
		description:
			'Block-based workspace. Private, self-hostable, native desktop or web.',
		type: 'desktop',
		status: 'beta',
		github: 'https://github.com/remcostoeten/skriuw',
		tech: ['Tauri', 'Rust', 'React'],
		preview: {
			type: 'iframe',
			url: 'https://skriuw.vercel.app',
			embedUrl: 'https://skriuw.vercel.app?embed=true'
		},
		spotlight: true,
		defaultOpen: true,
		platforms: ['macos', 'windows', 'linux']
	},
	{
		name: 'Dora',
		description:
			'Native database manager for PostgreSQL, LibSQL, SQLite. No Electron.',
		type: 'desktop',
		status: 'wip',
		github: 'https://github.com/remcostoeten/dora',
		tech: ['Rust', 'Tauri', 'React', 'Golang'],
		preview: {
			type: 'iframe',
			url: 'https://doradb.vercel.app',
			embedUrl: 'https://doradb.vercel.app?embed=true'
		},
		spotlight: true,
		defaultOpen: false,
		showIndicatorOnScroll: true,
		platforms: ['macos', 'windows', 'linux']
	}
]

export const otherProjects: IProject[] = [
	{
		name: 'Beautiful File Tree',
		description:
			'Performant interactive file tree visualization component with syntax highlighting',
		type: 'ui',
		status: 'done',
		github: 'https://github.com/remcostoeten/Beautiful-interactive-file-tree',
		tech: ['React', 'Framer Motion', 'Shiki'],
		preview: {
			type: 'iframe',
			url: 'https://beautiful-file-tree-v2.vercel.app'
		}
	},
	{
		name: 'Beautiful Codeblock',
		description:
			'Feature-rich React codeblock component with syntax highlighting and copy',
		type: 'ui',
		status: 'done',
		github: 'https://github.com/remcostoeten/react-beautiful-featurerich-codeblock',
		tech: ['React', 'TypeScript'],
		preview: {
			type: 'iframe',
			url: 'https://beautiful-codeblock.vercel.app'
		}
	},
	{
		name: 'Instagram Tracker',
		description:
			'Dashboard for tracking Instagram followers with detailed snapshot reports',
		type: 'saas',
		status: 'wip',
		github: 'https://github.com/remcostoeten/instagram-unfollow-tracker-dashboard',
		tech: ['Next.js', 'TypeScript'],
		preview: { type: 'none' }
	},
	{
		name: 'Turso DB Creator',
		description:
			'CLI tool to auto-generate Turso/LibSQL databases and retrieve env credentials',
		type: 'cli',
		status: 'done',
		github: 'https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials',
		tech: ['TypeScript', 'CLI'],
		preview: { type: 'none' }
	},
	{
		name: 'RYOA',
		description:
			'Roll your own auth in Next.js - JWT, Postgres, OAuth2, workspaces, invites',
		type: 'utility',
		status: 'done',
		github: 'https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication',
		tech: ['Next.js', 'PostgreSQL', 'JWT'],
		preview: { type: 'none' }
	},
	{
		name: 'CSS Theme Creator',
		description:
			'Visually build CSS variable or Tailwind 3/4 config from an image',
		type: 'utility',
		status: 'done',
		github: 'https://github.com/remcostoeten/theme-color-config-creator',
		tech: ['React', 'TypeScript'],
		preview: { type: 'none' }
	},
	{
		name: 'gh-select',
		description: 'GitHub CLI extension for interactive repo selection',
		type: 'cli',
		status: 'done',
		github: 'https://github.com/remcostoeten/gh-select',
		tech: ['Go', 'Zig', 'Bash', 'Bubble Tea'],
		preview: { type: 'none' }
	},
	{
		name: 'OAuth Creator',
		description: 'Automate GitHub & Google OAuth app creation from CLI',
		type: 'cli',
		status: 'done',
		github: 'https://github.com/remcostoeten/automatic-oauth-github-creator',
		tech: ['Python', 'Playwright'],
		preview: { type: 'none' }
	},
	{
		name: 'btwfyi',
		description:
			'Package for rendering task list in dev environment with shared DB adapters',
		type: 'ui',
		status: 'done',
		github: 'https://github.com/remcostoeten/btwfyi',
		tech: ['React', 'TypeScript'],
		preview: {
			type: 'iframe',
			url: 'https://github.com/remcostoeten/btwfyi/tree/master/examples/react'
		}
	},
	{
		name: 'Geolocation Manager',
		description:
			'Smart geolocation browser spoofer with React app and Chrome extension',
		type: 'utility',
		status: 'done',
		github: 'https://github.com/remcostoeten/geolocation-manager',
		tech: ['React', 'Chrome Extension'],
		preview: { type: 'none' }
	},
	{
		name: 'Fync',
		description:
			'Unified API for GitHub, GitLab, Vercel, Spotify, Notion, NPM and more',
		type: 'utility',
		status: 'wip',
		github: 'https://github.com/remcostoeten/fync',
		tech: ['TypeScript', 'API'],
		preview: { type: 'none' }
	},
	{
		name: 'Servo',
		description:
			'Terminal dev launcher with various project management options',
		type: 'cli',
		status: 'done',
		github: 'https://github.com/remcostoeten/servo',
		tech: ['TypeScript', 'CLI'],
		preview: { type: 'none' }
	},
	{
		name: 'Drizzleasy',
		description: 'Simplified Drizzle ORM utilities and helpers',
		type: 'utility',
		status: 'wip',
		github: 'https://github.com/remcostoeten/drizzleasy',
		tech: ['TypeScript', 'Drizzle'],
		preview: { type: 'none' }
	}
]
