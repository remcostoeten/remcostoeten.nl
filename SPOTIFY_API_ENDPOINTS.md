# Spotify Web API Endpoints

## Base URL
`https://api.spotify.com/v1`

## Authentication Endpoints
- `POST /api/token` - Get access token
- `POST /api/token` - Refresh access token

## Albums
- `GET /albums/{id}` - Get album
- `GET /albums` - Get several albums
- `GET /albums/{id}/tracks` - Get album tracks
- `GET /me/albums` - Get user's saved albums
- `PUT /me/albums` - Save albums for current user
- `DELETE /me/albums` - Remove albums for current user
- `GET /me/albums/contains` - Check user's saved albums

## Artists
- `GET /artists/{id}` - Get artist
- `GET /artists` - Get several artists
- `GET /artists/{id}/albums` - Get artist's albums
- `GET /artists/{id}/top-tracks` - Get artist's top tracks
- `GET /artists/{id}/related-artists` - Get related artists

## Audiobooks
- `GET /audiobooks/{id}` - Get audiobook
- `GET /audiobooks` - Get several audiobooks
- `GET /audiobooks/{id}/chapters` - Get audiobook chapters
- `GET /me/audiobooks` - Get user's saved audiobooks
- `PUT /me/audiobooks` - Save audiobooks for current user
- `DELETE /me/audiobooks` - Remove audiobooks for current user
- `GET /me/audiobooks/contains` - Check user's saved audiobooks

## Browse
- `GET /browse/new-releases` - Get new releases
- `GET /browse/featured-playlists` - Get featured playlists
- `GET /browse/categories` - Get categories
- `GET /browse/categories/{category_id}` - Get category
- `GET /browse/categories/{category_id}/playlists` - Get category's playlists
- `GET /recommendations` - Get recommendations
- `GET /recommendations/available-genre-seeds` - Get available genre seeds

## Chapters
- `GET /chapters/{id}` - Get chapter
- `GET /chapters` - Get several chapters

## Episodes
- `GET /episodes/{id}` - Get episode
- `GET /episodes` - Get several episodes
- `GET /me/episodes` - Get user's saved episodes
- `PUT /me/episodes` - Save episodes for current user
- `DELETE /me/episodes` - Remove episodes for current user
- `GET /me/episodes/contains` - Check user's saved episodes

## Genres
- `GET /recommendations/available-genre-seeds` - Get available genre seeds

## Markets
- `GET /markets` - Get available markets

## Player
- `GET /me/player` - Get playback state
- `PUT /me/player` - Transfer playback
- `GET /me/player/devices` - Get available devices
- `GET /me/player/currently-playing` - Get currently playing track
- `PUT /me/player/play` - Start/resume playback
- `PUT /me/player/pause` - Pause playback
- `POST /me/player/next` - Skip to next
- `POST /me/player/previous` - Skip to previous
- `PUT /me/player/seek` - Seek to position
- `PUT /me/player/repeat` - Set repeat mode
- `PUT /me/player/volume` - Set volume
- `PUT /me/player/shuffle` - Toggle shuffle
- `GET /me/player/recently-played` - Get recently played tracks
- `GET /me/player/queue` - Get the user's queue
- `POST /me/player/queue` - Add item to queue

## Playlists
- `GET /playlists/{playlist_id}` - Get playlist
- `PUT /playlists/{playlist_id}` - Change playlist details
- `GET /playlists/{playlist_id}/tracks` - Get playlist tracks
- `POST /playlists/{playlist_id}/tracks` - Add tracks to playlist
- `PUT /playlists/{playlist_id}/tracks` - Update playlist tracks
- `DELETE /playlists/{playlist_id}/tracks` - Remove tracks from playlist
- `GET /me/playlists` - Get current user's playlists
- `GET /users/{user_id}/playlists` - Get user's playlists
- `POST /users/{user_id}/playlists` - Create playlist
- `GET /playlists/{playlist_id}/followers` - Get playlist followers
- `PUT /playlists/{playlist_id}/followers` - Follow playlist
- `DELETE /playlists/{playlist_id}/followers` - Unfollow playlist
- `GET /playlists/{playlist_id}/followers/contains` - Check if users follow playlist
- `GET /playlists/{playlist_id}/images` - Get playlist cover image
- `PUT /playlists/{playlist_id}/images` - Add custom playlist cover image

## Search
- `GET /search` - Search for item

## Shows
- `GET /shows/{id}` - Get show
- `GET /shows` - Get several shows
- `GET /shows/{id}/episodes` - Get show episodes
- `GET /me/shows` - Get user's saved shows
- `PUT /me/shows` - Save shows for current user
- `DELETE /me/shows` - Remove shows for current user
- `GET /me/shows/contains` - Check user's saved shows

## Tracks
- `GET /tracks/{id}` - Get track
- `GET /tracks` - Get several tracks
- `GET /me/tracks` - Get user's saved tracks
- `PUT /me/tracks` - Save tracks for current user
- `DELETE /me/tracks` - Remove tracks for current user
- `GET /me/tracks/contains` - Check user's saved tracks
- `GET /audio-features/{id}` - Get audio features for track
- `GET /audio-features` - Get audio features for several tracks
- `GET /audio-analysis/{id}` - Get audio analysis for track

## Users
- `GET /me` - Get current user's profile
- `GET /users/{user_id}` - Get user's profile
- `PUT /me` - Update current user's profile
- `GET /me/following` - Get followed artists
- `PUT /me/following` - Follow artists or users
- `DELETE /me/following` - Unfollow artists or users
- `GET /me/following/contains` - Check if current user follows artists or users
- `GET /users/{user_id}/followers` - Get user's followers
- `GET /me/top/artists` - Get user's top artists
- `GET /me/top/tracks` - Get user's top tracks

## Common Query Parameters
- `limit` - Number of items to return (default: 20, max: 50)
- `offset` - Index of first item to return (default: 0)
- `market` - ISO 3166-1 alpha-2 country code
- `fields` - Filters for the query (comma-separated list)
- `additional_types` - List of item types to return (track, episode)
- `include_groups` - Filter album types (album, single, appears_on, compilation)
- `time_range` - Time range for top items (short_term, medium_term, long_term)

## Authorization Scopes
- `ugc-image-upload` - Upload images to Spotify
- `user-read-playback-state` - Read access to player state
- `user-modify-playback-state` - Write access to player
- `user-read-currently-playing` - Read access to currently playing track
- `streaming` - Control Spotify Connect devices
- `app-remote-control` - Remote control playback
- `user-read-email` - Read access to user's email
- `user-read-private` - Read access to user's subscription details
- `playlist-read-collaborative` - Read access to collaborative playlists
- `playlist-modify-public` - Write access to public playlists
- `playlist-read-private` - Read access to private playlists
- `playlist-modify-private` - Write access to private playlists
- `user-library-modify` - Write/delete access to user's library
- `user-library-read` - Read access to user's library
- `user-top-read` - Read access to user's top artists and tracks
- `user-read-playback-position` - Read access to playback position
- `user-read-recently-played` - Read access to recently played tracks
- `user-follow-read` - Read access to followed artists and users
- `user-follow-modify` - Write/delete access to followed artists and users

## Rate Limiting
- Rate limit: 100 requests per minute per application
- Burst limit: 10 requests per second
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable
