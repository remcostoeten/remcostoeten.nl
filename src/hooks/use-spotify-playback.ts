'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentPlayback, SpotifyTrack, formatDuration } from '@/server/services/spotify';

export interface SpotifyPlaybackState {
    track: SpotifyTrack | null;
    progress: number;
    duration: number;
    isPlaying: boolean;
    percentage: number;
    formattedProgress: string;
    formattedDuration: string;
}

const POLL_INTERVAL = 'connection' in navigator &&
    (navigator.connection as any)?.saveData
    ? 30000 // 30 seconds on data saver mode (balanced UX)
    : 'connection' in navigator && ((navigator.connection as any)?.effectiveType === 'slow-2g' || (navigator.connection as any)?.effectiveType === '2g')
    ? 20000 // 20 seconds on slow connections
    : 10000; // 10 seconds on normal connections (still responsive)
const TIMER_INTERVAL = 200; // Update local progress every 200ms
const DRIFT_THRESHOLD = 2000; // Hard reset if drift > 2 seconds

/**
 * Real-time Spotify playback monitor hook
 * 
 * Features:
 * - Polls Spotify API every 3 seconds
 * - Updates progress locally every 200ms for smooth UI
 * - Drift compensation: resyncs with API on each poll
 * - T0 reset on track change
 * - Handles pause/resume/seek correctly
 */
export function useSpotifyPlayback(): SpotifyPlaybackState {
    const [state, setState] = useState<SpotifyPlaybackState>({
        track: null,
        progress: 0,
        duration: 0,
        isPlaying: false,
        percentage: 0,
        formattedProgress: '0:00',
        formattedDuration: '0:00',
    });

    const T0Ref = useRef<number>(0);
    const lastTrackIdRef = useRef<string | null>(null);
    const lastProgressRef = useRef<number>(0);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

      const calculateProgress = (isPlaying: boolean, duration: number): number => {
        if (!isPlaying) {
            return lastProgressRef.current;
        }
        const elapsed = Date.now() - T0Ref.current;
        return Math.min(elapsed, duration);
    };

      const updateLocalProgress = () => {
        setState((prev) => {
            if (!prev.track || !prev.isPlaying) return prev;

            const currentProgress = calculateProgress(prev.isPlaying, prev.duration);
            const percentage = prev.duration > 0 ? (currentProgress / prev.duration) * 100 : 0;

            return {
                ...prev,
                progress: currentProgress,
                percentage: Math.min(percentage, 100),
                formattedProgress: formatDuration(currentProgress),
            };
        });
    };

      const fetchPlaybackState = async () => {
        const playback = await getCurrentPlayback();

        if (!playback || !playback.track) {
            // Nothing playing
            setState({
                track: null,
                progress: 0,
                duration: 0,
                isPlaying: false,
                percentage: 0,
                formattedProgress: '0:00',
                formattedDuration: '0:00',
            });
            lastTrackIdRef.current = null;
            return;
        }

        const { track, progress_ms, duration_ms, is_playing } = playback;
        const trackChanged = lastTrackIdRef.current !== track.id;

          const newT0 = Date.now() - progress_ms;

        // Detect drift (if local progress differs significantly from API)
        const localProgress = calculateProgress(is_playing, duration_ms);
        const drift = Math.abs(localProgress - progress_ms);
        const shouldHardReset = drift > DRIFT_THRESHOLD || trackChanged;

        if (shouldHardReset) {
                T0Ref.current = newT0;
            lastProgressRef.current = progress_ms;
        } else {
            // Soft sync: gradually adjust T0
            T0Ref.current = newT0;
        }

        lastTrackIdRef.current = track.id;
        lastProgressRef.current = progress_ms;

        const percentage = duration_ms > 0 ? (progress_ms / duration_ms) * 100 : 0;

        setState({
            track,
            progress: progress_ms,
            duration: duration_ms,
            isPlaying: is_playing,
            percentage: Math.min(percentage, 100),
            formattedProgress: formatDuration(progress_ms),
            formattedDuration: formatDuration(duration_ms),
        });
    };

        useEffect(() => {
          fetchPlaybackState();

          pollIntervalRef.current = setInterval(fetchPlaybackState, POLL_INTERVAL);

            timerIntervalRef.current = setInterval(updateLocalProgress, TIMER_INTERVAL);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    return state;
}
