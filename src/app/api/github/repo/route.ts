import { NextRequest, NextResponse } from 'next/server'

const GITHUB_API_BASE = 'https://api.github.com'

// Language colors from GitHub
const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Python: '#3572A5',
	Rust: '#dea584',
	Go: '#00ADD8',
	Java: '#b07219',
	'C++': '#f34b7d',
	C: '#555555',
	'C#': '#178600',
	Ruby: '#701516',
	PHP: '#4F5D95',
	Swift: '#F05138',
	Kotlin: '#A97BFF',
	Dart: '#00B4AB',
	Shell: '#89e051',
	HTML: '#e34c26',
	CSS: '#563d7c',
	SCSS: '#c6538c',
	Vue: '#41b883',
	Svelte: '#ff3e00',
	Astro: '#ff5a03',
	MDX: '#fcb32c'
}

function getHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'remcostoeten-portfolio-activity'
	}

	const token =
		process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
	if (token) {
		headers['Authorization'] = `token ${token}`
	}

	return headers
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const owner = searchParams.get('owner')
	const repo = searchParams.get('repo')

	if (!owner || !repo) {
		return NextResponse.json(
			{ error: 'Missing owner or repo parameter' },
			{ status: 400 }
		)
	}

	try {
		const [repoRes, langRes] = await Promise.all([
			fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
				headers: getHeaders(),
				next: { revalidate: 300 }
			}),
			fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, {
				headers: getHeaders(),
				next: { revalidate: 300 }
			})
		])

		if (!repoRes.ok) {
			return NextResponse.json(
				{ error: `GitHub API error: ${repoRes.status}` },
				{ status: repoRes.status }
			)
		}

		const repoData = await repoRes.json()
		const langData = langRes.ok ? await langRes.json() : {}

		const totalBytes: number = Object.values(
			langData as Record<string, number>
		).reduce((sum, val) => sum + val, 0)
		const languages = Object.entries(langData as Record<string, number>)
			.map(([name, bytes]) => ({
				name,
				color: LANGUAGE_COLORS[name] || '#6e7681',
				percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
			}))
			.sort((a, b) => b.percentage - a.percentage)
			.slice(0, 5)

		return NextResponse.json({
			name: repoData.name,
			fullName: repoData.full_name,
			description: repoData.description,
			url: repoData.html_url,
			topics: repoData.topics || [],
			languages,
			stars: repoData.stargazers_count,
			forks: repoData.forks_count,
			isPrivate: repoData.private,
			owner: {
				login: repoData.owner?.login,
				avatarUrl: repoData.owner?.avatar_url
			}
		})
	} catch (error) {
		console.error('Error fetching repo data:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch repository data' },
			{ status: 500 }
		)
	}
}
