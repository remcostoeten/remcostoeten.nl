import type { ReactNode } from "react"
import { GitCommit, Disc3, Play } from "lucide-react"
import { cn } from "@/shared/utilities/cn"

/**
 * ActivityShell - Fixed height layout structure for zero layout shift
 */

type props = {
  className?: string
  githubContent?: ReactNode
  spotifyContent?: ReactNode
  isSpotifyCurrentlyPlaying?: boolean
}

export function ActivityShell({ className, githubContent, spotifyContent, isSpotifyCurrentlyPlaying = false }: props) {
  return (
    <section
      className={cn(
        "w-full max-w-[672px] p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm relative",
        className,
      )}
      aria-labelledby="latest-activity-heading"
      style={{ zIndex: 1 }}
    >
      <h2 id="latest-activity-heading" className="sr-only">
        Latest Development Activity
      </h2>

      <div className="grid grid-rows-2 gap-4">
        {/* GitHub Activity Row - Fixed minimum height with overflow control */}
        <div className="flex items-start gap-3 min-h-[4rem] overflow-hidden">
          <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0" aria-hidden="true">
            <GitCommit className="w-4 h-4 text-accent" />
          </div>

          <div
            className="leading-tight min-w-0 flex-1 overflow-hidden"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="text-muted-foreground overflow-hidden">{githubContent}</div>
          </div>
        </div>

        {/* Spotify Activity Row - Fixed minimum height with overflow control */}
        <div className="flex items-start gap-3 min-h-[4rem] pt-4 border-t border-border/30 overflow-hidden">
          <h3 className="sr-only">Music Activity</h3>

          <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
            {isSpotifyCurrentlyPlaying ? (
              <Play className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <Disc3 className="w-4 h-4 text-green-500" aria-hidden="true" />
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-out">{spotifyContent}</div>
        </div>
      </div>
    </section>
  )
}

