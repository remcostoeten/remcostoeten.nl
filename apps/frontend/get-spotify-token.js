#!/usr/bin/env node

/**
 * Spotify Token Helper Script
 * 
 * This script helps you get a Spotify refresh token for your application.
 * 
 * Steps:
 * 1. Make sure your .env file has the correct SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET
 * 2. Run: node get-spotify-token.js
 * 3. Follow the URL that gets printed
 * 4. Authorize your app
 * 5. Copy the 'code' parameter from the redirect URL
 * 6. Run: node get-spotify-token.js <code>
 * 7. Copy the refresh_token to your .env file
 */

const https = require('https');
const querystring = require('querystring');

// Load environment variables
require('dotenv').config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/api/spotify/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing Spotify credentials in .env file');
  console.error('Make sure you have SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET set');
  process.exit(1);
}

const code = process.argv[2];

if (!code) {
  // Step 1: Generate authorization URL
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-state'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    show_dialog: 'true'
  })}`;

  console.log('🎵 Spotify Token Setup');
  console.log('===================');
  console.log('');
  console.log('1. Open this URL in your browser:');
  console.log('');
  console.log(authUrl);
  console.log('');
  console.log('2. Authorize your app');
  console.log('3. Copy the "code" parameter from the redirect URL');
  console.log('4. Run: node get-spotify-token.js <code>');
  console.log('');
} else {
  // Step 2: Exchange code for tokens
  const postData = querystring.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI
  });

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const options = {
    hostname: 'accounts.spotify.com',
    port: 443,
    path: '/api/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.error) {
          console.error('❌ Error:', response.error);
          console.error('Description:', response.error_description);
        } else {
          console.log('✅ Success! Here are your tokens:');
          console.log('');
          console.log('Access Token:', response.access_token);
          console.log('Refresh Token:', response.refresh_token);
          console.log('');
          console.log('Add this to your .env file:');
          console.log(`SPOTIFY_REFRESH_TOKEN=${response.refresh_token}`);
          console.log('');
          console.log('The access token expires in', response.expires_in, 'seconds');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.error('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.write(postData);
  req.end();
}