import { ListeningStatus } from './ListeningStatus';
import { useRecentTracks } from './hooks/useRecentTracks';

export const ListeningStatusExample = () => {
  const { tracks, loading, error } = useRecentTracks({
    limit: 5,
    refreshInterval: 60000 // refresh every minute
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <ListeningStatus
      prefixText="while listening to"
      tracks={tracks}
      interval={3000} // cycle tracks every 3 seconds
      className="max-w-md"
    />
  );
};

// Alternative usage with mock data for testing
export const ListeningStatusDemo = () => {
  const mockTracks = [
    {
      name: "Blinding Lights",
      artists: [{ name: "The Weeknd" }],
      album: { name: "After Hours" }
    },
    {
      name: "Watermelon Sugar",
      artists: [{ name: "Harry Styles" }],
      album: { name: "Fine Line" }
    },
    {
      name: "Good 4 U",
      artists: [{ name: "Olivia Rodrigo" }],
      album: { name: "SOUR" }
    },
    {
      name: "Levitating",
      artists: [{ name: "Dua Lipa" }],
      album: { name: "Future Nostalgia" }
    },
    {
      name: "Peaches",
      artists: [{ name: "Justin Bieber" }, { name: "Daniel Caesar" }, { name: "Giveon" }],
      album: { name: "Justice" }
    }
  ];

  return (
    <ListeningStatus
      prefixText="while jamming to"
      tracks={mockTracks}
      interval={2500}
      className="max-w-lg"
    />
  );
};
