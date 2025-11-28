import type { SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service"

export type TSpotifyData = {
  tracks: (SpotifyTrack | SpotifyRecentTrack)[]
  currentTrack: SpotifyTrack | SpotifyRecentTrack | null
  loading: boolean
  error: string | null
}

