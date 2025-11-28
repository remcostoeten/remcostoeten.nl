
"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo } from "react"
import type {
  SpotifyTrack,
  SpotifyRecentTrack,
} from "@/services/spotify-service"
import { SpotifyActivityContent, SpotifyActivitySkeletonContent, SpotifyActivityErrorContent } from "./spotify-content"
import type { TSpotifyData } from "../types"

export const SpotifyIntegration = memo(function SpotifyIntegration() {
  const [spotifyData, setSpotifyData] = useState<TSpotifyData>({
    tracks: [],
    currentTrack: null,
    loading: true,
    error: null,
  })
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const loadSpotifyData = useCallback(async () => {
    try {
      setSpotifyData((prev) => ({ ...prev, loading: true, error: null }))

      const [currentResponse, recentResponse] = await Promise.all([
        fetch('/api/activity/spotify/current'),
        fetch('/api/activity/spotify/recent?limit=5')
      ])

      let currentTrack: SpotifyTrack | SpotifyRecentTrack | null = null
      let recentTracks: SpotifyRecentTrack[] = []

      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        currentTrack = currentData.track
      } else {
        console.warn('Failed to fetch current track:', currentResponse.statusText)
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        recentTracks = recentData.tracks || []
      } else {
        console.warn('Failed to fetch recent tracks:', recentResponse.statusText)
      }

      const allTracks: (SpotifyTrack | SpotifyRecentTrack)[] = []

      if (currentTrack && "is_playing" in currentTrack && currentTrack.is_playing) {
        allTracks.push(currentTrack)
      }

      const trackSet = new Set(allTracks.map((t) => `${t.name}-${t.artist}`))
      recentTracks.forEach((track) => {
        const key = `${track.name}-${track.artist}`
        if (!trackSet.has(key)) {
          allTracks.push(track)
          trackSet.add(key)
        }
      })

      if (allTracks.length === 0 && currentTrack) {
        allTracks.push(currentTrack)
      }

      setSpotifyData({
        tracks: allTracks,
        currentTrack: allTracks[0] || null,
        loading: false,
        error: allTracks.length === 0 ? "No music data available" : null,
      })

      setCurrentTrackIndex(0)
    } catch (error) {
      console.error("Failed to load Spotify data:", error)
      setSpotifyData({
        tracks: [],
        currentTrack: null,
        loading: false,
        error: "Failed to load music data",
      })
    }
  }, [])

  useEffect(() => {
    loadSpotifyData()
  }, [loadSpotifyData])

  useEffect(() => {
    if (spotifyData.tracks.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentTrackIndex((prev) => {
        const nextIndex = (prev + 1) % spotifyData.tracks.length
        setSpotifyData((prevData) => ({
          ...prevData,
          currentTrack: prevData.tracks[nextIndex],
        }))
        return nextIndex
      })
    }, 5950)

    return () => clearInterval(interval)
  }, [spotifyData.tracks.length, isPaused])

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true)
    setHoveredTrack(currentTrackIndex)
  }, [currentTrackIndex])

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false)
    setHoveredTrack(null)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    })
  }, [])

  const { currentTrack, loading, error } = spotifyData

  if (loading) {
    return <SpotifyActivitySkeletonContent />
  }

  if (error || !currentTrack) {
    return <SpotifyActivityErrorContent />
  }

  const isCurrentlyPlaying = "is_playing" in currentTrack && currentTrack.is_playing

  return (
    <div className="relative">
      <SpotifyActivityContent
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        isCurrentlyPlaying={isCurrentlyPlaying}
        hoveredTrack={hoveredTrack}
        mousePosition={mousePosition}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      />
    </div>
  )
})
