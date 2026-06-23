import { execSync } from 'node:child_process'
import path from 'node:path'
import type { YTMusicTrack } from '@/features/ytmusic/types'

const PYTHON_VENV = path.resolve(
	process.cwd(),
	'scripts/ytmusic/.venv/bin/python3'
)
const HISTORY_SCRIPT = path.resolve(
	process.cwd(),
	'scripts/ytmusic/get_history.py'
)
const OAUTH_FILE = path.resolve(process.cwd(), 'scripts/ytmusic/oauth.json')

let oauthAvailable: boolean | null = null

export function hasOAuthCredentials(): boolean {
	if (oauthAvailable !== null) return oauthAvailable
	let available = false
	try {
		const { existsSync } = require('node:fs') as typeof import('node:fs')
		available = existsSync(OAUTH_FILE)
	} catch {
		available = false
	}
	oauthAvailable = available
	return available
}

interface YtmusicapiTrack {
	title?: string
	artists?: { name: string }[]
	album?: { name: string; thumbnails?: { url: string }[] }
	videoId?: string
	played?: string
}

function parsePythonHistory(raw: YtmusicapiTrack[]): YTMusicTrack[] {
	return raw.map(item => ({
		id: item.videoId || '',
		name: item.title || 'Unknown',
		artist: item.artists?.map(a => a.name).join(', ') || 'Unknown',
		album: item.album?.name || '',
		url: item.videoId
			? `https://music.youtube.com/watch?v=${item.videoId}`
			: '',
		image: item.album?.thumbnails?.slice(-1)[0]?.url || '',
		played_at: item.played || new Date().toISOString()
	}))
}

export function getPythonYTMusicTracks(limit: number): YTMusicTrack[] {
	if (!hasOAuthCredentials()) return []

	try {
		const result = execSync(`${PYTHON_VENV} ${HISTORY_SCRIPT} ${limit}`, {
			encoding: 'utf-8',
			timeout: 15000
		})
		const data = JSON.parse(result.trim())
		return parsePythonHistory(data)
	} catch (error) {
		console.error('[YTM Python] Error:', error)
		return []
	}
}

export async function getLocalServerTracks(
	limit: number
): Promise<YTMusicTrack[]> {
	try {
		const res = await fetch(`http://127.0.0.1:8370/recent?limit=${limit}`, {
			signal: AbortSignal.timeout(5000)
		})
		if (!res.ok) return []
		const data = await res.json()
		if (!Array.isArray(data) || data.length === 0) return []
		return data.map((t: any) => ({
			id: t.id || '',
			name: t.name || 'Unknown',
			artist:
				(t.artist || '').replace(/,?\s*•\s*/g, '').trim() || 'Unknown',
			album: t.album || '',
			url: `https://music.youtube.com/watch?v=${t.id}`,
			image: t.image || '',
			played_at: t.played_at || new Date().toISOString()
		}))
	} catch {
		return []
	}
}
