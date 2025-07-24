// Simple test file to verify components work
import React from 'react';
import { ListeningStatusDemo, TrackHoverCard } from './index';

// Test component to verify all widgets work
export const WidgetTest = () => {
  const testTrack = {
    name: "Test Song",
    artists: [{ name: "Test Artist" }],
    album: { 
      name: "Test Album",
      images: [{ url: "https://via.placeholder.com/640x640", width: 640, height: 640 }]
    },
    duration_ms: 180000,
    explicit: false
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Demo with Mock Data:</h2>
        <ListeningStatusDemo />
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Hover Card Test:</h2>
        <TrackHoverCard track={testTrack}>
          <span className="text-blue-500 underline">Hover me to see track details</span>
        </TrackHoverCard>
      </div>
    </div>
  );
};

export default WidgetTest;
