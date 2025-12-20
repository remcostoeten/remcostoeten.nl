'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentPlayback, SpotifyTrack, formatDuration } from '@/server/services/spotify';

export interface SpotifyPlaybackState {
    track: SpotifyTrack | null;
    progress: number; // Current progress in ms
    duration: number; // Total duration in ms
    isPlaying: boolean;
    percentage: number; // Progress percentage (0-100)
    formattedProgress: string; // "mm:ss"
    formattedDuration: string; // "mm:ss"
}

const POLL_INTERVAL = 'connection' in navigator && navigator.connection?.saveData
    ? 30000 // 30 seconds on data saver mode (balanced UX)
    : 'connection' in navigator && navigator.connection?.effectiveType === 'slow-2g' || navigator.connection?.effectiveType === '2g'
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

    const T0Ref = useRef<number>(0); // Timestamp when playback started (Date.now() - progress_ms)
    const lastTrackIdRef = useRef<string | null>(null);
    const lastProgressRef = useRef<number>(0);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate current progress based on T0
    const calculateProgress = (isPlaying: boolean, duration: number): number => {
        if (!isPlaying) {
            return lastProgressRef.current;
        }
        const elapsed = Date.now() - T0Ref.current;
        return Math.min(elapsed, duration);
    };

    // Update local progress (runs every 200ms)
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

    // Fetch playback state from API
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

        // Calculate T0 (timestamp when playback started)
        const newT0 = Date.now() - progress_ms;

        // Detect drift (if local progress differs significantly from API)
        const localProgress = calculateProgress(is_playing, duration_ms);
        const drift = Math.abs(localProgress - progress_ms);
        const shouldHardReset = drift > DRIFT_THRESHOLD || trackChanged;

        if (shouldHardReset) {
            // Hard reset T0 on track change or significant drift
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

    // Setup polling and timer
    useEffect(() => {
        // Initial fetch
        fetchPlaybackState();

        // Poll API every 3 seconds
        pollIntervalRef.current = setInterval(fetchPlaybackState, POLL_INTERVAL);

        // Update local progress every 200ms
        timerIntervalRef.current = setInterval(updateLocalProgress, TIMER_INTERVAL);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    return state;
}
