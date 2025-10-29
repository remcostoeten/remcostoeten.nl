#!/usr/bin/env node

// Simple script to fetch and display current Spotify recent tracks via API
const https = require('https');
const http = require('http');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function logCurrentTracks() {
  try {
    console.log('🎵 Fetching current Spotify recent tracks...\n');

    // Call the local API endpoint
    const baseUrl = 'http://localhost:3000'; // Adjust if your app runs on different port
    const url = `${baseUrl}/api/auth/spotify/recent?limit=10`;

    let recentTracks;
    try {
      recentTracks = await makeRequest(url);
    } catch (apiError) {
      console.log('❌ Could not reach local API. Make sure the development server is running (npm run dev)');
      console.log('   Trying alternative approach...\n');

      // Fallback: create example data to show structure
      const now = new Date();
      recentTracks = [
        {
          name: "Example Song 1",
          artist: "Example Artist 1",
          album: "Example Album 1",
          external_url: "https://open.spotify.com/track/example1",
          image_url: "https://i.scdn.co/image/ab67616d0000b2737d8b5c5b5b5b5b5b5b5b5b5b",
          played_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        },
        {
          name: "Example Song 2",
          artist: "Example Artist 2",
          album: "Example Album 2",
          external_url: "https://open.spotify.com/track/example2",
          image_url: "https://i.scdn.co/image/ab67616d0000b2737d8b5c5b5b5b5b5b5b5b5b5b",
          played_at: new Date(now.getTime() - 120 * 60 * 1000).toISOString() // 2 hours ago
        }
      ];

      console.log('📝 Using example data (API server not available):\n');
    }

    if (recentTracks.error) {
      console.log(`❌ API Error: ${recentTracks.error}`);
      console.log('   This might mean:\n   - No Spotify refresh token configured\n   - Spotify API rate limiting\n   - Authentication issues');
      return;
    }

    if (!Array.isArray(recentTracks) || recentTracks.length === 0) {
      console.log('📭 No recent tracks found');
      return;
    }

    console.log(`📊 Found ${recentTracks.length} recent tracks:\n`);

    recentTracks.forEach((track, index) => {
      const playedAt = new Date(track.played_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - playedAt.getTime()) / (1000 * 60));

      let relativeTime;
      if (diffInMinutes < 1) {
        relativeTime = 'just now';
      } else if (diffInMinutes < 60) {
        relativeTime = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        relativeTime = `${hours} hour${hours === 1 ? '' : 's'} ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        relativeTime = `${days} day${days === 1 ? '' : 's'} ago`;
      }

      console.log(`${index + 1}. "${track.name}" by ${track.artist}`);
      console.log(`   Album: ${track.album}`);
      console.log(`   Played: ${relativeTime} (${track.played_at})`);
      console.log(`   Link: ${track.external_url}`);
      console.log(`   Image: ${track.image_url || 'N/A'}`);
      console.log('');
    });

    // Log the raw array structure
    console.log('🔍 Raw array structure:');
    console.log(JSON.stringify(recentTracks, null, 2));

  } catch (error) {
    console.error('❌ Error fetching recent tracks:', error.message);
  }
}

logCurrentTracks();