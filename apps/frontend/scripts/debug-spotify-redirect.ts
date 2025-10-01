#!/usr/bin/env tsx

/**
 * Spotify Redirect URI Debug Script
 * 
 * This script helps debug redirect URI issues by showing exactly what
 * your app is sending vs what Spotify expects.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
try {
  const envFile = readFileSync(join(process.cwd(), '.env'), 'utf8');
  const envVars = envFile.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
  
  envVars.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      process.env[key.trim()] = value;
    }
  });
} catch (error) {
  console.log('⚠️  Could not load .env file');
}

console.log('🔍 Spotify Redirect URI Debug Tool\n');

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

console.log('📋 Current Configuration:');
console.log('=========================');
console.log(`Client ID: ${clientId}`);
console.log(`Redirect URI: ${redirectUri}`);

console.log('\n🎯 What Should Be in Spotify Dashboard:');
console.log('=======================================');
console.log('App Settings → Edit Settings → Redirect URIs:');
console.log('✅ http://127.0.0.1:3000/api/auth/spotify/callback');

console.log('\n❌ Common Mistakes to Avoid:');
console.log('============================');
console.log('❌ http://localhost:3000/api/auth/spotify/callback (use 127.0.0.1, not localhost)');
console.log('❌ http://127.0.0.1:3000/api/spotify/callback (missing /auth/)');
console.log('❌ https://127.0.0.1:3000/api/auth/spotify/callback (should be http, not https)');
console.log('❌ http://127.0.0.1:3001/api/auth/spotify/callback (wrong port)');

console.log('\n🔗 Test URLs:');
console.log('=============');

if (clientId && redirectUri) {
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=user-read-currently-playing+user-read-recently-played+user-read-playback-state&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true`;
  
  console.log('Current auth URL:');
  console.log(authUrl);
  
  console.log('\nDecoded redirect_uri parameter:');
  console.log(redirectUri);
  
  // Check if redirect URI matches expected format
  const expectedUri = 'http://127.0.0.1:3000/api/auth/spotify/callback';
  if (redirectUri === expectedUri) {
    console.log('\n✅ Redirect URI format is correct!');
  } else {
    console.log('\n❌ Redirect URI format is incorrect!');
    console.log(`Expected: ${expectedUri}`);
    console.log(`Got:      ${redirectUri}`);
  }
} else {
  console.log('❌ Missing client ID or redirect URI in environment variables');
}

console.log('\n🚀 Steps to Fix:');
console.log('================');
console.log('1. Go to https://developer.spotify.com/dashboard');
console.log('2. Select your app');
console.log('3. Click "Edit Settings"');
console.log('4. In "Redirect URIs", add: http://127.0.0.1:3000/api/auth/spotify/callback');
console.log('5. Remove any incorrect URIs');
console.log('6. Click "Save"');
console.log('7. Wait 1-2 minutes for changes to propagate');
console.log('8. Try the authorization flow again');

console.log('\n✨ Debug complete!');