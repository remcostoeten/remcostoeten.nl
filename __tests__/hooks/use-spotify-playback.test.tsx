// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSpotifyPlayback } from '@/hooks/use-spotify-playback'

type ProbeProps = {
	enabled: boolean
}

function Probe({ enabled }: ProbeProps) {
	useSpotifyPlayback(enabled)
	return null
}

const NOW_PLAYING_URL = '/api/spotify/now-playing'

describe('useSpotifyPlayback', () => {
	let container: HTMLDivElement
	let root: Root
	let fetchMock: ReturnType<typeof vi.fn>

	function render(enabled: boolean) {
		act(() => {
			root.render(<Probe enabled={enabled} />)
		})
	}

	async function advance(ms: number) {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(ms)
		})
	}

	function nowPlayingCalls() {
		return fetchMock.mock.calls.filter(([url]) => url === NOW_PLAYING_URL)
			.length
	}

	beforeEach(() => {
		Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
		vi.useFakeTimers()
		fetchMock = vi.fn(async () => Response.json({ isPlaying: false }))
		vi.stubGlobal('fetch', fetchMock)
		container = document.createElement('div')
		root = createRoot(container)
	})

	afterEach(() => {
		act(() => root.unmount())
		vi.unstubAllGlobals()
	})

	it('makes no requests while disabled', async () => {
		render(false)
		await advance(120_000)

		expect(nowPlayingCalls()).toBe(0)
	})

	it('starts polling three seconds after load once enabled', async () => {
		render(true)
		await advance(2_900)
		expect(nowPlayingCalls()).toBe(0)

		await advance(200)
		expect(nowPlayingCalls()).toBe(1)
	})

	it('stops polling when disabled again', async () => {
		render(true)
		await advance(3_100)
		expect(nowPlayingCalls()).toBe(1)

		render(false)
		await advance(300_000)

		expect(nowPlayingCalls()).toBe(1)
	})
})
