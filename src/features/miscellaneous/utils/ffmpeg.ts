import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { noop } from '@/shared/lib/noop'

const CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

type TProgressHandler = (ratio: number) => void

let loading: Promise<FFmpeg> | null = null
let progressHandler: TProgressHandler = noop

/**
 * Points ffmpeg progress events (0..1) at the given handler. Pass `noop` to
 * detach when a conversion finishes.
 */
export function setFFmpegProgressHandler(handler: TProgressHandler): void {
	progressHandler = handler
}

async function createInstance(): Promise<FFmpeg> {
	const [{ FFmpeg: FFmpegClass }, { toBlobURL }] = await Promise.all([
		import('@ffmpeg/ffmpeg'),
		import('@ffmpeg/util')
	])

	const ffmpeg = new FFmpegClass()
	await ffmpeg.load({
		coreURL: await toBlobURL(
			`${CORE_BASE_URL}/ffmpeg-core.js`,
			'text/javascript'
		),
		wasmURL: await toBlobURL(
			`${CORE_BASE_URL}/ffmpeg-core.wasm`,
			'application/wasm'
		)
	})

	ffmpeg.on('progress', ({ progress }) => {
		progressHandler(progress)
	})

	return ffmpeg
}

/**
 * Loads the single-threaded ffmpeg.wasm core (fetched from a CDN on first
 * use) and memoizes the instance for the rest of the session. The instance is
 * shared by every media tool.
 */
export function loadFFmpeg(): Promise<FFmpeg> {
	if (!loading) {
		loading = createInstance()
		loading.catch(() => {
			loading = null
		})
	}
	return loading
}

/**
 * Runs an ffmpeg command and throws with the last log lines when it exits
 * non-zero, so failures surface a useful message instead of a bare code.
 */
export async function execWithLogs(
	ffmpeg: FFmpeg,
	args: string[]
): Promise<void> {
	const logs: string[] = []
	const onLog = ({ message }: { message: string }) => {
		logs.push(message)
	}
	ffmpeg.on('log', onLog)

	try {
		const exitCode = await ffmpeg.exec(args)
		if (exitCode !== 0) {
			const tail = logs.slice(-10).join('\n')
			throw new Error(`FFmpeg exited with ${exitCode}:\n${tail}`)
		}
	} finally {
		ffmpeg.off('log', onLog)
	}
}

/**
 * Writes a browser File into the ffmpeg virtual filesystem under the given
 * name, replacing any previous file with that name.
 */
export async function writeInputFile(
	ffmpeg: FFmpeg,
	name: string,
	file: File
): Promise<void> {
	const { fetchFile } = await import('@ffmpeg/util')
	await deleteQuiet(ffmpeg, name)
	await ffmpeg.writeFile(name, await fetchFile(file))
}

/**
 * Deletes a file from the ffmpeg virtual filesystem, ignoring missing files.
 */
export async function deleteQuiet(ffmpeg: FFmpeg, name: string): Promise<void> {
	try {
		await ffmpeg.deleteFile(name)
	} catch {
		noop()
	}
}

/**
 * Reads an output file as a Blob, throwing when it is missing or empty.
 */
export async function readOutputBlob(
	ffmpeg: FFmpeg,
	name: string,
	type: string
): Promise<Blob> {
	const data = await ffmpeg.readFile(name)
	if (typeof data === 'string') {
		throw new Error(`Expected binary data for ${name} but got a string`)
	}
	const bytes = new Uint8Array(data)
	if (bytes.byteLength === 0) {
		throw new Error(`Output file ${name} is empty (0 bytes)`)
	}
	return new Blob([bytes], { type })
}
