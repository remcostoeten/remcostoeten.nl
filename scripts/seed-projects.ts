import { db } from '../src/server/db/connection'
import { projects, projectSettings } from '../src/server/db/project-schema'

const projectsData = [
	{
		idx: 1,
		title: 'Skriuw',
		desc: 'Block-based workspace. Private, self-hostable, native desktop or web.',
		featured: true,
		gitUrl: 'https://github.com/remcostoeten/skriuw',
		demoUrl: 'https://skriuw.vercel.app',
		demoBox: 'https://skriuw.vercel.app?embed=true',
		labels: ['Tauri', 'Rust', 'React'],
		native: true,
		defaultOpen: true,
		showIndicator: false
	},
	{
		idx: 2,
		title: 'Dora',
		desc: 'Native database manager for PostgreSQL, LibSQL, SQLite. No Electron.',
		featured: true,
		gitUrl: 'https://github.com/remcostoeten/dora',
		demoUrl: 'https://doradb.vercel.app',
		demoBox: 'https://doradb.vercel.app?embed=true',
		labels: ['Rust', 'Tauri', 'React', 'Golang'],
		native: true,
		defaultOpen: false,
		showIndicator: true
	},
	{
		idx: 3,
		title: 'Beautiful File Tree',
		desc: 'Performant interactive file tree visualization component with syntax highlighting',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/Beautiful-interactive-file-tree',
		demoUrl: 'https://beautiful-file-tree-v2.vercel.app',
		labels: ['React', 'Framer Motion', 'Shiki'],
		native: false
	},
	{
		idx: 4,
		title: 'Beautiful Codeblock',
		desc: 'Feature-rich React codeblock component with syntax highlighting and copy',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/react-beautiful-featurerich-codeblock',
		demoUrl: 'https://beautiful-codeblock.vercel.app',
		labels: ['React', 'TypeScript'],
		native: false
	},
	{
		idx: 5,
		title: 'Instagram Tracker',
		desc: 'Dashboard for tracking Instagram followers with detailed snapshot reports',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/instagram-unfollow-tracker-dashboard',
		labels: ['Next.js', 'TypeScript'],
		native: false
	},
	{
		idx: 6,
		title: 'Turso DB Creator',
		desc: 'CLI tool to auto-generate Turso/LibSQL databases and retrieve env credentials',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials',
		labels: ['TypeScript', 'CLI'],
		native: false
	},
	{
		idx: 7,
		title: 'RYOA',
		desc: 'Roll your own auth in Next.js - JWT, Postgres, OAuth2, workspaces, invites',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication',
		labels: ['Next.js', 'PostgreSQL', 'JWT'],
		native: false
	},
	{
		idx: 8,
		title: 'CSS Theme Creator',
		desc: 'Visually build CSS variable or Tailwind 3/4 config from an image',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/theme-color-config-creator',
		labels: ['React', 'TypeScript'],
		native: false
	},
	{
		idx: 9,
		title: 'gh-select',
		desc: 'GitHub CLI extension for interactive repo selection',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/gh-select',
		labels: ['Go', 'Zig', 'Bash', 'Bubble Tea'],
		native: false
	},
	{
		idx: 10,
		title: 'OAuth Creator',
		desc: 'Automate GitHub & Google OAuth app creation from CLI',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/automatic-oauth-github-creator',
		labels: ['Python', 'Playwright'],
		native: false
	},
	{
		idx: 11,
		title: 'btwfyi',
		desc: 'Package for rendering task list in dev environment with shared DB adapters',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/btwfyi',
		demoUrl:
			'https://github.com/remcostoeten/btwfyi/tree/master/examples/react',
		labels: ['React', 'TypeScript'],
		native: false
	},
	{
		idx: 12,
		title: 'Geolocation Manager',
		desc: 'Smart geolocation browser spoofer with React app and Chrome extension',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/geolocation-manager',
		labels: ['React', 'Chrome Extension'],
		native: false
	},
	{
		idx: 13,
		title: 'Fync',
		desc: 'Unified API for GitHub, GitLab, Vercel, Spotify, Notion, NPM and more',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/fync',
		labels: ['TypeScript', 'API'],
		native: false
	},
	{
		idx: 14,
		title: 'Servo',
		desc: 'Terminal dev launcher with various project management options',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/servo',
		labels: ['TypeScript', 'CLI'],
		native: false
	},
	{
		idx: 15,
		title: 'Drizzleasy',
		desc: 'Simplified Drizzle ORM utilities and helpers',
		featured: false,
		gitUrl: 'https://github.com/remcostoeten/drizzleasy',
		labels: ['TypeScript', 'Drizzle'],
		native: false
	}
]

async function seed() {
	console.log('Seeding projects...')

	await db.delete(projects)
	console.log('Cleared existing projects')

	for (const project of projectsData) {
		await db.insert(projects).values(project)
		console.log(`Added: ${project.title}`)
	}

	await db
		.insert(projectSettings)
		.values({ id: 'singleton', showN: 6 })
		.onConflictDoNothing()

	console.log('Done seeding!')
	process.exit(0)
}

seed().catch(e => {
	console.error(e)
	process.exit(1)
})
