"use client";

import { ExternalLink, Music } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type TProps = {
	track: {
		name: string;
		artist: string;
		album: string;
		albumImageUrl?: string;
		url: string;
	};
	children: React.ReactNode;
};

type TExternalUrl = {
	name: string;
	url: string;
	icon: React.ReactNode;
};

function generateExternalUrls(
	trackName: string,
	artistName: string,
): TExternalUrl[] {
	const encodedTrack = encodeURIComponent(trackName);
	const encodedArtist = encodeURIComponent(artistName);
	const searchQuery = encodeURIComponent(`${trackName} ${artistName}`);

	return [
		{
			name: "Apple Music",
			url: `https://music.apple.com/search?term=${searchQuery}`,
			icon: <Music className="w-4 h-4" />,
		},
		{
			name: "YouTube Music",
			url: `https://music.youtube.com/search?q=${searchQuery}`,
			icon: <Music className="w-4 h-4" />,
		},
		{
			name: "Deezer",
			url: `https://www.deezer.com/search/${searchQuery}`,
			icon: <Music className="w-4 h-4" />,
		},
		{
			name: "Tidal",
			url: `https://tidal.com/search?q=${searchQuery}`,
			icon: <Music className="w-4 h-4" />,
		},
	];
}

export function TrackPopover({ track, children }: TProps) {
	const externalUrls = generateExternalUrls(track.name, track.artist);

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-80 p-4">
				<div className="flex gap-4">
					{track.albumImageUrl ? (
						<img
							src={track.albumImageUrl}
							alt={track.album}
							className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
						/>
					) : (
						<div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
							<Music className="w-8 h-8 text-muted-foreground" />
						</div>
					)}

					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-base truncate" title={track.name}>
							{track.name}
						</h3>
						<p
							className="text-sm text-muted-foreground truncate"
							title={track.artist}
						>
							by {track.artist}
						</p>
						<p
							className="text-sm text-muted-foreground truncate mt-1"
							title={track.album}
						>
							{track.album}
						</p>
					</div>
				</div>

				<div className="mt-4 space-y-2">
					<h4 className="text-sm font-medium text-muted-foreground">
						Listen on:
					</h4>

					<a
						href={track.url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
					>
						<div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
							<div className="w-2 h-2 bg-white rounded-full" />
						</div>
						<span className="text-sm">Spotify</span>
						<ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
					</a>

					{externalUrls.map((platform) => (
						<a
							key={platform.name}
							href={platform.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
						>
							{platform.icon}
							<span className="text-sm">{platform.name}</span>
							<ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
						</a>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
