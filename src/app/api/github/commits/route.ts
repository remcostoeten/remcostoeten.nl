import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const GITHUB_API_BASE = 'https://api.github.com'

interface GitHubCommit {
	sha: string
	html_url: string
	commit: {
		author: {
			name: string
			email: string
			date: string
		}
		message: string
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const owner = searchParams.get('owner')
		const repo = searchParams.get('repo')

		if (!owner || !repo) {
			return NextResponse.json(
				{ error: 'Missing owner or repo parameter' },
				{ status: 400 }
			)
		}

		const token = process.env.GITHUB_TOKEN

		const headers: Record<string, string> = {
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'remcostoeten-portfolio-activity'
		}

		if (token && token !== 'your_github_token_here') {
			headers['Authorization'] = `token ${token}`
		}

		const response = await fetch(
			`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
			{
				headers,
				next: { revalidate: 300 }
			}
		)

		if (!response.ok) {
			const rateLimitRemaining = response.headers.get(
				'x-ratelimit-remaining'
			)

			if (response.status === 404) {
				console.log(`Repository ${owner}/${repo} not found (404)`)
				return NextResponse.json({
					commit: null,
					error: 'Repository not found',
					status: 404
				})
			}

			console.error(
				`GitHub API error for ${owner}/${repo}: ${response.status} ${response.statusText}. Rate limit remaining: ${rateLimitRemaining}`
			)
			return NextResponse.json(
				{
					error: `GitHub API error: ${response.statusText}`,
					status: response.status
				},
				{ status: response.status }
			)
		}

		const commits: GitHubCommit[] = await response.json()

		if (commits.length === 0) {
			return NextResponse.json({ commit: null })
		}

		const latestCommit = commits[0]

		const commitData = {
			hash: latestCommit.sha,
			shortHash: latestCommit.sha.substring(0, 7),
			message: latestCommit.commit.message,
			date: latestCommit.commit.author.date,
			url: latestCommit.html_url,
			author: latestCommit.commit.author.name
		}

		return NextResponse.json({ commit: commitData })
	} catch (error) {
		console.error('Error in GitHub commits API:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch commits' },
			{ status: 500 }
		)
	}
}
