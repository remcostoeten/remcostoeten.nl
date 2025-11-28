"use client"

import type React from "react"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service"
import { formatRelativeTimeExact } from "@/services/spotify-service"
import { SpotifyHoverCard } from "./spotify-hover-card"
import Link from "next/link"
import { Disc3 } from "lucide-react"


type SpotifyActivityContentProps = {
  currentTrack: SpotifyTrack | SpotifyRecentTrack
  currentTrackIndex: number
  isCurrentlyPlaying: boolean
  hoveredTrack: number | null
  mousePosition: { x: number; y: number }
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMouseMove: (e: React.MouseEvent) => void
}

export const SpotifyActivityContent = memo(function SpotifyActivityContent({
  currentTrack,
  currentTrackIndex,
  isCurrentlyPlaying,
  hoveredTrack,
  mousePosition,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
}: SpotifyActivityContentProps) {
  const STAGGER_DURATION = 0.6
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
  const BASE_DELAY = 0.05
  const STAGGER_DELAY = 0.08

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + order * STAGGER_DELAY,
      ease: STAGGER_EASE,
      filter: { duration: 0.4 },
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const relativeTimeText = (() => {
    if (isCurrentlyPlaying && "started_at" in currentTrack && currentTrack.started_at) {
      return `Started ${formatRelativeTimeExact(currentTrack.started_at)}`
    }
    if (!isCurrentlyPlaying && "played_at" in currentTrack && currentTrack.played_at) {
      return formatRelativeTimeExact(currentTrack.played_at)
    }
    return null
  })()

  const statusPrefix = isCurrentlyPlaying ? "Whilst currently listening to" : "Whilst probably listening to"
  const albumTitle = (currentTrack.album || '').trim()
  const trackTitle = currentTrack.name.trim()
  const shouldShowAlbum = Boolean(albumTitle) && albumTitle.toLowerCase() !== trackTitle.toLowerCase()

  const MAX_FIRST_LINE_LENGTH = 70
  const MAX_TRACK_LENGTH_DEFAULT = 36
  const MAX_ARTIST_LENGTH_DEFAULT = 30
  const MIN_TRACK_LENGTH = 14
  const MIN_ARTIST_LENGTH = 12

  const firstLineApproxLength =
    statusPrefix.length + trackTitle.length + currentTrack.artist.length + 7
  const accentWidthAllowance = isCurrentlyPlaying ? 6 : 0

  let trackMaxLength = MAX_TRACK_LENGTH_DEFAULT
  let artistMaxLength = MAX_ARTIST_LENGTH_DEFAULT

  if (firstLineApproxLength > MAX_FIRST_LINE_LENGTH - accentWidthAllowance) {
    const overflow = firstLineApproxLength - (MAX_FIRST_LINE_LENGTH - accentWidthAllowance)
    const trackReduction = Math.min(
      overflow,
      Math.max(0, trackMaxLength - MIN_TRACK_LENGTH)
    )
    trackMaxLength -= trackReduction

    const remainingOverflow = overflow - trackReduction
    if (remainingOverflow > 0) {
      const artistReduction = Math.min(
        remainingOverflow,
        Math.max(0, artistMaxLength - MIN_ARTIST_LENGTH)
      )
      artistMaxLength -= artistReduction
    }
  }

  const truncatedTrackTitle = truncateText(trackTitle, trackMaxLength)
  const truncatedArtist = truncateText(currentTrack.artist, artistMaxLength)

  const MAX_SECOND_LINE_LENGTH = 60
  let albumMaxLength = 35
  if (relativeTimeText) {
    const estimatedSecondLineLength =
      (shouldShowAlbum ? albumTitle.length : 0) + relativeTimeText.length + 5
    if (estimatedSecondLineLength > MAX_SECOND_LINE_LENGTH && shouldShowAlbum) {
      const overflowSecond = estimatedSecondLineLength - MAX_SECOND_LINE_LENGTH
      albumMaxLength = Math.max(12, albumMaxLength - overflowSecond)
    }
  }
  const truncatedAlbum = truncateText(albumTitle, albumMaxLength)

  return (
    <div className="flex-1 min-w-0 relative group w-full overflow-hidden h-full" onMouseMove={onMouseMove}>
      <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex flex-nowrap items-center gap-1">
        <span className="flex-shrink-0">{statusPrefix}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`track-${currentTrackIndex}`}
            className="inline-flex min-w-0 flex-nowrap gap-1 overflow-hidden"
            initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={buildStaggerTransition(0)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Link
              href={currentTrack.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground transition-colors px-1 py-0.5 rounded hover:text-accent hover:bg-accent/10 truncate max-w-full"
              title={currentTrack.name}
            >
              {truncatedTrackTitle}
            </Link>
            <span className="flex-shrink-0">by</span>
            <span
              className="font-medium text-foreground truncate max-w-[200px] transition-colors hover:text-accent"
              title={currentTrack.artist}
            >
              {truncatedArtist}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      {(shouldShowAlbum || relativeTimeText) && (
        <div
          className="mt-1 text-xs text-muted-foreground/90 flex flex-nowrap items-center gap-2"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {shouldShowAlbum && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <Disc3 className="w-3 h-3" aria-hidden="true" />
              <span
                className="truncate text-muted-foreground transition-colors hover:text-accent"
                title={albumTitle}
              >
                {truncatedAlbum}
              </span>
            </span>
          )}
          {relativeTimeText && (
            <span
              className="text-muted-foreground flex-shrink-0"
            >
              ({relativeTimeText})
            </span>
          )}
        </div>
      )}

      <div className="absolute left-0 top-full mt-2 z-[999999] w-80 max-w-[90vw]">
        <SpotifyHoverCard
          track={currentTrack}
          isVisible={hoveredTrack === currentTrackIndex}
          mousePosition={mousePosition}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </div>
    </div>
  )
})

/**
 * SpotifyActivitySkeleton - Matches exact dimensions
 */
export function SpotifyActivitySkeletonContent() {
  const STAGGER_DURATION = 0.6
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
  const BASE_DELAY = 0.05
  const STAGGER_DELAY = 0.08

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + order * STAGGER_DELAY,
      ease: STAGGER_EASE,
      filter: { duration: 0.4 },
    }
  }

  return (
    <div className="flex-1 min-w-0 relative overflow-hidden h-full">
      <div className="space-y-1 overflow-hidden">
        {/* First Line */}
        <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex items-baseline gap-1">
          <span className="flex-shrink-0">Recently listened to</span>
          <span className="inline-block min-w-0 flex-1 h-5">
            <motion.span
              className="h-5 bg-muted/60 rounded-md w-full block"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(0)}
            />
          </span>
        </div>

        {/* Second Line */}
        <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex items-baseline gap-1">
          <span className="flex-shrink-0">by</span>
          <span className="inline-block min-w-0 flex-1 h-5">
            <motion.span
              className="h-5 bg-muted/40 rounded-md w-full block"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(1)}
            />
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * SpotifyActivityError - Fixed height error state
 */
export function SpotifyActivityErrorContent() {
  return (
    <div className="flex-1 min-w-0 h-full flex items-center overflow-hidden">
      <span className="text-sm text-muted-foreground truncate">No music activity available</span>
    </div>
  )
}
