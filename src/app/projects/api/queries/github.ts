'use server'

import type { GithubRef } from '../../types/project'

export type GithubData = {
  url: string
  license?: string
  createdAt?: string
  updatedAt?: string
  stars?: number
  forks?: number
}

export async function getGithubData(ref: GithubRef): Promise<GithubData | null> {
  const endpoint = `https://api.github.com/repos/${ref.owner}/${ref.repo}`

  try {
    const response = await fetch(endpoint, {
      headers: getHeaders(),
      next: {
        revalidate: 3600,
      },
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as GithubResponse

    if (!payload.html_url) {
      return null
    }

    const stars = payload.stargazers_count ?? 0
    const forks = payload.forks_count ?? 0

    return {
      url: payload.html_url,
      license: payload.license?.name,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
      stars: stars > 0 ? stars : undefined,
      forks,
    }
  } catch (error: unknown) {
    return null
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  return headers
}

type GithubResponse = {
  html_url?: string
  license?: {
    name?: string
  } | null
  created_at?: string
  updated_at?: string
  stargazers_count?: number
  forks_count?: number
}
