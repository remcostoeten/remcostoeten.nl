"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { TextSkeleton } from "@/components/ui/text-skeleton";
import { TrackPopover } from "./track-popover";

type TProps = {
  refreshInterval?: number;
  showAlbumImage?: boolean;
  layout?: "inline" | "card";
};

type TSpotifyTrack = {
  name: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  url: string;
  isPlaying: boolean;
};

type TSpotifyResponse = {
  title: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  songUrl: string;
  isPlaying: boolean;
};

export async function fetchNowPlaying(): Promise<TSpotifyTrack | null> {
  try {
    const response = await fetch("/api/spotify/now-playing");

    if (!response.ok) {
      console.error("Failed to fetch Spotify data:", response.status);
      return null;
    }

    const data: TSpotifyResponse = await response.json();

    if (!data.isPlaying) {
      return null;
    }

    return {
      name: data.title,
      artist: data.artist,
      album: data.album,
      albumImageUrl: data.albumImageUrl,
      url: data.songUrl,
      isPlaying: data.isPlaying,
    };
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return null;
  }
}

export async function getNowPlaying(): Promise<TSpotifyTrack | null> {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error("Missing Spotify environment variables");
    return null;
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
    const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";

    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: REFRESH_TOKEN,
      }),
    });

    const { access_token } = await tokenResponse.json();

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.status === 204 || response.status > 400) {
      return null;
    }

    const song = await response.json();

    if (!song.item || !song.is_playing) {
      return null;
    }

    return {
      name: song.item.name,
      artist: song.item.artists.map((artist: any) => artist.name).join(", "),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url,
      url: song.item.external_urls.spotify,
      isPlaying: song.is_playing,
    };
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return null;
  }
}

export function SpotifyNowPlaying({ 
  refreshInterval = 30000, 
  showAlbumImage = false,
  layout = "inline"
}: TProps) {
  const [track, setTrack] = useState<TSpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(function setupSpotifyFetch() {
    async function fetchTrack() {
      try {
        setIsLoading(true);
        const currentTrack = await fetchNowPlaying();
        setTrack(currentTrack);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrack();

    const interval = setInterval(fetchTrack, refreshInterval);
    return function cleanup() {
      clearInterval(interval);
    };
  }, [refreshInterval]);

  if (isLoading) {
    return (
      <FadeIn>
        <div className="flex items-center gap-3">
          {showAlbumImage && (
            <div className="w-12 h-12 bg-muted rounded-md animate-pulse" />
          )}
          <div className="flex-1">
            <TextSkeleton width="160px" />
            <TextSkeleton width="120px" />
          </div>
        </div>
      </FadeIn>
    );
  }

  if (!track) {
    return (
      <FadeIn>
        <div className="text-base text-foreground leading-relaxed">
          Not currently playing anything
        </div>
      </FadeIn>
    );
  }

  if (layout === "card") {
    return (
      <FadeIn>
        <AnimatePresence mode="wait">
          <motion.div
            key={track.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            {showAlbumImage && track.albumImageUrl && (
              <img
                src={track.albumImageUrl}
                alt={track.album}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">
                <TrackPopover track={track}>
                  <button className="text-accent hover:underline cursor-pointer">
                    {track.name}
                  </button>
                </TrackPopover>
              </div>
              <div className="text-sm text-muted-foreground">
                by {track.artist}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              🎵 Now playing
            </div>
          </motion.div>
        </AnimatePresence>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="text-foreground leading-relaxed text-base">
        Currently listening to{" "}
        <AnimatePresence mode="wait">
          <motion.span
            key={track.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TrackPopover track={track}>
              <button className="text-accent hover:underline font-medium cursor-pointer">
                {track.name}
              </button>
            </TrackPopover>{" "}
            by {track.artist}
          </motion.span>
        </AnimatePresence>
      </div>
    </FadeIn>
  );
}
