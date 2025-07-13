import { useEffect, useState } from "react";

type TProps = {
	refreshInterval?: number;
};

type TSpotifyTrack = {
	name: string;
	artist: string;
	album: string;
	url: string;
	isPlaying: boolean;
};

async function getCurrentlyPlaying(): Promise<TSpotifyTrack | null> {
	try {
		const spotifyApiUrl = process.env.NEXT_PUBLIC_SPOTIFY_API_URL;

		if (!spotifyApiUrl) {
			console.warn("NEXT_PUBLIC_SPOTIFY_API_URL not configured");
			return null;
		}

		const response = await fetch(spotifyApiUrl);

		if (!response.ok) {
			console.error("Failed to fetch Spotify data:", response.status);
			return null;
		}

		const data = await response.json();

		if (!data.isPlaying) {
			return null;
		}

		return {
			name: data.title || data.name,
			artist: data.artist,
			album: data.album,
			url: data.songUrl || data.url,
			isPlaying: data.isPlaying,
		};
	} catch (error) {
		console.error("Error fetching Spotify data:", error);
		return null;
	}
}

export function NowPlaying({ refreshInterval = 30000 }: TProps) {
	const [track, setTrack] = useState<TSpotifyTrack | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchTrack() {
			const currentTrack = await getCurrentlyPlaying();
			setTrack(currentTrack);
			setIsLoading(false);
		}

		fetchTrack();

		const interval = setInterval(fetchTrack, refreshInterval);
		return () => clearInterval(interval);
	}, [refreshInterval]);

	if (isLoading) {
		return (
			<div className="text-foreground leading-relaxed text-base">Loading music...</div>
		);
	}

	if (!track) {
		return (
			<div className="text-foreground leading-relaxed text-base">
				Not listening to anything right now
			</div>
		);
	}

	return (
		<div className="text-foreground leading-relaxed text-base">
			Currently listening to{" "}
			<a
				href={track.url}
				target="_blank"
				rel="noreferrer"
				className="text-accent hover:underline font-medium"
			>
				{track.name}
			</a>{" "}
			by {track.artist}
		</div>
	);
}
