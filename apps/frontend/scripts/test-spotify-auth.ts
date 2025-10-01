#!/usr/bin/env tsx

/**
 * Spotify Authentication Test Script
 * 
 * This script helps debug Spotify authentication issues by:
 * 1. Checking environment variables
 * 2. Testing the authorization URL generation
 * 3. Validating credentials format
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

// Simple auth URL generation (inline to avoid import issues)
const getSpotifyAuthUrl = (): string => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

    if (!clientId) {
        throw new Error('NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set in environment variables');
    }

    const scopes = [
        'user-read-currently-playing',
        'user-read-recently-played',
        'user-read-playback-state'
    ].join(' ');

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: scopes,
        redirect_uri: redirectUri || 'http://127.0.0.1:3000/api/auth/spotify/callback',
        show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

console.log('🎵 Spotify Authentication Debug Tool\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('================================');

const requiredVars = [
    'NEXT_PUBLIC_SPOTIFY_CLIENT_ID',
    'NEXT_PUBLIC_SPOTIFY_REDIRECT_URI',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SPOTIFY_REDIRECT_URI'
];

const optionalVars = [
    'SPOTIFY_REFRESH_TOKEN'
];

let hasAllRequired = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ?
        (varName.includes('SECRET') ? `${value.substring(0, 8)}...` : value) :
        'MISSING';

    console.log(`${status} ${varName}: ${displayValue}`);

    if (!value) {
        hasAllRequired = false;
    }
});

console.log('\n📋 Optional Variables:');
console.log('=====================');

optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value && value !== 'your_refresh_token_here' ? '✅' : '⚠️';
    const displayValue = value && value !== 'your_refresh_token_here' ?
        `${value.substring(0, 10)}...` :
        'NOT SET';

    console.log(`${status} ${varName}: ${displayValue}`);
});

if (!hasAllRequired) {
    console.log('\n❌ Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Test authorization URL generation
console.log('\n🔗 Authorization URL Test:');
console.log('==========================');

try {
    const authUrl = getSpotifyAuthUrl();
    console.log('✅ Authorization URL generated successfully');
    console.log(`🔗 URL: ${authUrl}`);

    // Parse and validate the URL
    const url = new URL(authUrl);
    const params = url.searchParams;

    console.log('\n📋 URL Parameters:');
    console.log('==================');
    console.log(`✅ client_id: ${params.get('client_id')}`);
    console.log(`✅ redirect_uri: ${params.get('redirect_uri')}`);
    console.log(`✅ response_type: ${params.get('response_type')}`);
    console.log(`✅ scope: ${params.get('scope')}`);
    console.log(`✅ show_dialog: ${params.get('show_dialog')}`);

} catch (error) {
    console.log('❌ Failed to generate authorization URL');
    console.error(error);
    process.exit(1);
}

// Validate credentials format
console.log('\n🔍 Credentials Validation:');
console.log('==========================');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (clientId) {
    if (clientId.length === 32 && /^[a-f0-9]+$/.test(clientId)) {
        console.log('✅ Client ID format looks correct (32 hex characters)');
    } else {
        console.log('⚠️  Client ID format might be incorrect (should be 32 hex characters)');
    }
}

if (clientSecret) {
    if (clientSecret.length === 32 && /^[a-f0-9]+$/.test(clientSecret)) {
        console.log('✅ Client Secret format looks correct (32 hex characters)');
    } else {
        console.log('⚠️  Client Secret format might be incorrect (should be 32 hex characters)');
    }
}

// Test redirect URI
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
if (redirectUri) {
    if (redirectUri.startsWith('http://127.0.0.1:3000/')) {
        console.log('✅ Redirect URI uses 127.0.0.1 (correct for Spotify)');
    } else if (redirectUri.includes('localhost')) {
        console.log('⚠️  Redirect URI uses localhost - Spotify requires 127.0.0.1');
    } else {
        console.log('✅ Redirect URI format looks correct');
    }
}

console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. If all checks pass, visit the authorization URL above');
console.log('2. Complete the Spotify authorization flow');
console.log('3. Copy the refresh token to your .env file');
console.log('4. Restart your development server');
console.log('5. Test the integration at /spotify-setup');

console.log('\n✨ Debug complete!');