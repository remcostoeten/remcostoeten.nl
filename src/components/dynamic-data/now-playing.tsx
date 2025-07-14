import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { Spinner } from "@/components/ui/spinner";
import { TextSkeleton } from "@/components/ui/text-skeleton";
import { TrackPopover } from "./track-popover";

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
		const response = await fetch("/api/spotify/now-playing");

		if (!response.ok) {
			console.error("Failed to fetch Spotify data:", response.status);
			return null;
		}

		const data = await response.json();

		if (!data.isPlaying) {
			return null;
		}

		return {
			name: data.title,
			artist: data.artist,
			album: data.album,
			url: data.songUrl,
			isPlaying: data.isPlaying,
		};
	} catch (error) {
		console.error("Error fetching Spotify data:", error);
		return null;
	}
}

export function NowPlaying({ refreshInterval = 30000 }: TProps) {
	const [track, setTrack] = useState<TSpotifyTrack | null>(null);
useEffect(function setupSpotifyFetch() {
    async function fetchTrack() {
        const currentTrack = await getCurrentlyPlaying();
        setTrack(currentTrack);
    }

    fetchTrack();

    const interval = setInterval(fetchTrack, refreshInterval);
    return function cleanup() {
        clearInterval(interval);
    };
}, [refreshInterval]);

return (
    <div className="text-foreground leading-relaxed text-base">
        Currently listening to {" "}
        {track ? (
            <AnimatePresence mode="wait">
                <motion.div
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
                </motion.div>
            </AnimatePresence>
        ) : (
            <div className="flex flex-col">
                <TextSkeleton width="160px" />
                <TextSkeleton width="120px" />
            </div>
        )}
    </div>
);
}
