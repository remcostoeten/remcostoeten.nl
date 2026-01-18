import type { IGitMetrics } from "../types"

const GITHUB_API = "https://api.github.com"

interface IGitHubCommit {
  sha: string
  commit: {
    message: string
    author: { date: string }
  }
}

interface IGitHubRepo {
  pushed_at: string
}

function extractOwnerRepo(githubUrl?: string): { owner: string; repo: string } | null {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") }
}

async function safeFetch(url: string, headers: HeadersInit): Promise<Response | null> {
  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } })
    if (res.status === 403 || res.status === 429) {
      console.warn(`GitHub rate limited for ${url}`)
      return null
    }
    if (!res.ok) return null
    return res
  } catch {
    return null
  }
}

export async function fetchGitMetrics(githubUrl: string): Promise<IGitMetrics | null> {
  const parsed = extractOwnerRepo(githubUrl)
  if (!parsed) return null

  const { owner, repo } = parsed
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
  }

  try {
    const repoRes = await safeFetch(`${GITHUB_API}/repos/${owner}/${repo}`, headers)
    if (!repoRes) return null
    const repoData: IGitHubRepo = await repoRes.json()

    const commitsRes = await safeFetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=1`, headers)
    if (!commitsRes) return null
    const commits: IGitHubCommit[] = await commitsRes.json()
    const latestCommit = commits[0]

    const linkHeader = commitsRes.headers.get("Link")
    let totalCommits = 1
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
      if (lastPageMatch) totalCommits = Number.parseInt(lastPageMatch[1], 10)
    }

    return {
      lastUpdated: repoData.pushed_at,
      lastCommitMessage: latestCommit?.commit.message.split("\n")[0] || "No commits",
      totalCommits,
      firstCommitDate: repoData.pushed_at,
      weeklyActivity: [],
    }
  } catch (error) {
    console.error(`Failed to fetch git metrics for ${githubUrl}:`, error)
    return null
  }
}

export async function enrichProjectsWithGitData<T extends { github: string; git?: IGitMetrics }>(
  projects: T[],
): Promise<T[]> {
  const enriched: T[] = []

  for (const project of projects) {
    if (project.git) {
      enriched.push(project)
      continue
    }
    const git = await fetchGitMetrics(project.github)
    enriched.push(git ? { ...project, git } : project)
    await new Promise((r) => setTimeout(r, 100))
  }

  return enriched
}
