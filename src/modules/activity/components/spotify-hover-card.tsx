"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service"
import { formatPlayedAtTimestamp, formatDuration } from "@/services/spotify-service"
import Image from "next/image"
import { Music, Clock, Play, Disc3 } from "lucide-react"
import Link from "next/link"

type props =  {
  track: SpotifyTrack | SpotifyRecentTrack
  isVisible: boolean
  mousePosition: { x: number; y: number }
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function SpotifyHoverCard({ track, isVisible, onMouseEnter, onMouseLeave }: props) {
  const getTrackInfo = () => {
    let statusText = ""
    let statusColor = "text-muted-foreground"
    let statusIcon = null

    if ("is_playing" in track && track.is_playing) {
      statusText = "Currently Playing"
      statusColor = "text-green-500"
      statusIcon = <Play className="w-3 h-3 text-green-500" />
    } else if ("played_at" in track && track.played_at) {
      statusText = `Played ${formatPlayedAtTimestamp(track.played_at)}`
      statusColor = "text-muted-foreground"
    } else if ("started_at" in track && track.started_at) {
      statusText = `Started ${formatPlayedAtTimestamp(track.started_at)}`
      statusColor = "text-green-500"
      statusIcon = <Play className="w-3 h-3 text-green-500" />
    }

    return { statusText, statusColor, statusIcon }
  }

  const { statusText, statusColor, statusIcon } = getTrackInfo()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-w-sm"
        >
          <div className="relative">
            {/* Album Art Background */}
            {track.image_url && (
              <div className="absolute inset-0 opacity-10">
                <Image
                  src={track.image_url}
                  alt=""
                  fill
                  className="object-cover blur-xl"
                />
              </div>
            )}

            <div className="relative p-4 space-y-4">
              {/* Header with Album Art */}
              <div className="flex gap-4">
                {track.image_url ? (
                  <div className="relative">
                    <Image
                      src={track.image_url}
                      alt={`${track.name} album art`}
                      width={100}
                      height={100}
                      className="rounded-lg flex-shrink-0 shadow-md"
                    />
                    {statusIcon && (
                      <div className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-lg border border-border">
                        {statusIcon}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  {/* Track Name */}
                  <Link
                    href={track.external_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-base text-foreground hover:text-green-500 transition-colors break-words line-clamp-2"
                    title={track.name}
                  >
                    {track.name}
                  </Link>

                  {/* Artist */}
                  <p className="text-sm text-muted-foreground break-words line-clamp-1" title={track.artist}>
                    {track.artist}
                  </p>

                  {/* Album */}
                  {track.album && (
                    <div className="flex items-center gap-2">
                      <Disc3 className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground truncate" title={track.album}>
                        {track.album}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div className={`flex items-center gap-2 ${statusColor}`}>
                    {statusIcon}
                    <span className="text-sm font-medium">{statusText}</span>
                  </div>
                </div>
              </div>

              {/* Audio Preview Button */}
              {track.preview_url && (
                <div className="flex items-center gap-2">
                  <audio
                    controls
                    src={track.preview_url}
                    className="h-8 flex-1"
                    preload="none"
                  />
                </div>
              )}

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {"duration_ms" in track && track.duration_ms && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{formatDuration(track.duration_ms)}</p>
                    </div>
                  </div>
                )}

                {"progress_ms" in track && track.progress_ms && track.duration_ms && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-medium text-foreground">
                        {Math.round((track.progress_ms / track.duration_ms) * 100)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Spotify Link */}
                <div className="col-span-2">
                  <Link
                    href={track.external_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-green-500 hover:text-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Open in Spotify
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

