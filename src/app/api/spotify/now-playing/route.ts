import { NextResponse } from "next/server";

type TSpotifyArtist = {
	name: string;
	id: string;
};

type TSpotifyAlbum = {
	name: string;
	images: { url: string }[];
};

type TSpotifyTrack = {
	name: string;
	artists: TSpotifyArtist[];
	album: TSpotifyAlbum;
	external_urls: { spotify: string };
};

type TSpotifyResponse = {
	is_playing: boolean;
	item: TSpotifyTrack | null;
};

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
const NOW_PLAYING_ENDPOINT =
	"https://api.spotify.com/v1/me/player/currently-playing";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

async function getAccessToken() {
	const response = await fetch(TOKEN_ENDPOINT, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: REFRESH_TOKEN!,
		}),
	});

	return response.json();
}

async function getNowPlaying() {
	const { access_token } = await getAccessToken();

	return fetch(NOW_PLAYING_ENDPOINT, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});
}

export async function GET() {
	try {
		const response = await getNowPlaying();

		if (response.status === 204 || response.status > 400) {
			return NextResponse.json({ isPlaying: false });
		}

		const song: TSpotifyResponse = await response.json();

		if (!song.item) {
			return NextResponse.json({ isPlaying: false });
		}

		const isPlaying = song.is_playing;
		const title = song.item.name;
		const artist = song.item.artists
			.map((artist: TSpotifyArtist) => artist.name)
			.join(", ");
		const album = song.item.album.name;
		const albumImageUrl = song.item.album.images[0]?.url;
		const songUrl = song.item.external_urls.spotify;

		return NextResponse.json({
			album,
			albumImageUrl,
			artist,
			isPlaying,
			songUrl,
			title,
		});
	} catch (error) {
		return NextResponse.json({ isPlaying: false });
	}
}
