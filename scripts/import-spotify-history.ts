import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { enrichSpotifyCatalog } from '@/server/spotify/catalog'
import { importStreamingHistory } from '@/server/spotify/history-import'
import type { StreamingHistoryEntry } from '@/server/spotify/mappers'

// Matches the audio files in Spotify's Extended streaming history download, e.g. Streaming_History_Audio_2023-2024_3.json.
const AUDIO_HISTORY_FILE = /^Streaming_History_Audio_.*\.json$/

async function collectFiles(input: string) {
	if (!(await stat(input)).isDirectory()) return [input]

	const names = await readdir(input)
	return names
		.filter(name => AUDIO_HISTORY_FILE.test(name))
		.map(name => path.join(input, name))
}

async function readEntries(file: string): Promise<StreamingHistoryEntry[]> {
	return JSON.parse(await readFile(file, 'utf8'))
}

const inputs = process.argv.slice(2)
if (inputs.length === 0) {
	console.error(
		'Usage: bun run spotify:import <export folder | Streaming_History_Audio_*.json ...>'
	)
	process.exit(1)
}

const files = (await Promise.all(inputs.map(collectFiles))).flat()
const entries = (await Promise.all(files.map(readEntries))).flat()
console.log(`Read ${entries.length} entries from ${files.length} files`)

const result = await importStreamingHistory(entries)
console.log(
	`Imported ${result.listens} plays of ${result.tracks} tracks, replaced ${result.replaced} API plays in the export's range`
)

let enriched = await enrichSpotifyCatalog()
let total = { tracks: 0, artists: 0 }
while (enriched.tracks + enriched.artists > 0) {
	total = {
		tracks: total.tracks + enriched.tracks,
		artists: total.artists + enriched.artists
	}
	console.log(`Enriched ${total.tracks} tracks and ${total.artists} artists`)
	enriched = await enrichSpotifyCatalog()
}
console.log('Done. Anything still pending is picked up by the hourly sync.')
