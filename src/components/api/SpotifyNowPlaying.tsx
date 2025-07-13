"use client";

import { APIEndpoint } from "./APIEndpoint";

interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifyNowPlayingData {
  isPlaying: boolean;
  track?: SpotifyTrack;
}

export default function SpotifyNowPlaying() {
  const renderSpotifyData = (data: SpotifyNowPlayingData) => {
    if (!data.isPlaying || !data.track) {
      return "Not currently playing anything";
    }

    const { track } = data;
    const artistNames = track.artists.map(artist => artist.name).join(", ");

    return (
      <div className="flex items-center gap-3">
        {track.album.images.length > 0 && (
          <img 
            src={track.album.images[0].url} 
            alt={track.album.name}
            className="w-12 h-12 rounded-md object-cover"
          />
        )}
        <div className="flex-1">
          <div className="font-medium">
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              {track.name}
            </a>
          </div>
          <div className="text-sm text-muted-foreground">
            by {artistNames}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          🎵 Now playing
        </div>
      </div>
    );
  };

  return (
    <APIEndpoint
      endpointUrl="/api/spotify/now-playing"
      refreshInterval={30000} // Refresh every 30 seconds
      render={renderSpotifyData}
    />
  );
}
