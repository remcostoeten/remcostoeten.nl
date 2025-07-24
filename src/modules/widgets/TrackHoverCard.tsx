import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ExternalLink, Music, Users } from 'lucide-react';
import type { Track } from './types';

interface TrackHoverCardProps {
  track: Track;
  children: React.ReactNode;
  disabled?: boolean;
}

export const TrackHoverCard = ({ track, children, disabled = false }: TrackHoverCardProps) => {
  if (disabled) {
    return <>{children}</>;
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'Unknown';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatReleaseDate = (date?: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPlayedAt = (date?: string) => {
    if (!date) return null;
    const playedDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - playedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return playedDate.toLocaleDateString();
  };

  const albumImage = track.album.images?.[0]?.url;
  const playedAtFormatted = formatPlayedAt(track.played_at);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:underline decoration-dotted underline-offset-2">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-3">
          {/* Header with album art and basic info */}
          <div className="flex gap-3">
            {albumImage ? (
              <img
                src={albumImage}
                alt={`${track.album.name} album cover`}
                className="w-16 h-16 rounded-md object-cover shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                <Music className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate" title={track.name}>
                {track.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate" title={track.artists.map(a => a.name).join(', ')}>
                <Users className="w-3 h-3 inline mr-1" />
                {track.artists.map(a => a.name).join(', ')}
              </p>
              <p className="text-xs text-muted-foreground truncate" title={track.album.name}>
                <Music className="w-3 h-3 inline mr-1" />
                {track.album.name}
              </p>
            </div>
          </div>

          <Separator />

          {/* Track details */}
          <div className="space-y-2 text-xs">
            {track.duration_ms && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>Duration: {formatDuration(track.duration_ms)}</span>
              </div>
            )}
            
            {track.album.release_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span>Released: {formatReleaseDate(track.album.release_date)}</span>
              </div>
            )}

            {playedAtFormatted && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>Played: {playedAtFormatted}</span>
              </div>
            )}

            {track.album.total_tracks && (
              <div className="flex items-center gap-2">
                <Music className="w-3 h-3 text-muted-foreground" />
                <span>Album: {track.album.total_tracks} tracks</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {track.explicit && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                E
              </Badge>
            )}
            {track.popularity !== undefined && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {track.popularity}% popular
              </Badge>
            )}
            {track.preview_url && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Preview available
              </Badge>
            )}
          </div>

          {/* External links */}
          <div className="flex gap-2">
            {track.external_urls?.spotify && (
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open in Spotify
              </a>
            )}
            {track.album.external_urls?.spotify && (
              <a
                href={track.album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View Album
              </a>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
