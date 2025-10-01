import type { LatestActivity as TLatestActivity } from '@/services/github-service';
import type { SpotifyTrack, SpotifyRecentTrack } from '@/services/spotify-service';

export type TRepositoryData = {
  repositoryName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  contributors: number;
  totalCommits: number;
  repositoryAge: string;
}

export type TSpotifyData = {
  tracks: (SpotifyTrack | SpotifyRecentTrack)[];
  currentTrack: SpotifyTrack | SpotifyRecentTrack | null;
  loading: boolean;
  error: string | null;
}

export type TCommitHoverCardProps = {
  activity: TLatestActivity;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export type TProjectStats = {
  totalProjects: number;
  totalStars: number;
  totalCommits: number;
  loading: boolean;
}