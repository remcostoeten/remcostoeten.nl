#!/usr/bin/env node

import readline from 'readline';
import { exec } from 'child_process';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * API Tester CLI
 * 
 * A small utility to test the local API endpoints used in the activity feed.
 * It fetches the data, renders the JSON, and copies the curl command to your clipboard.
 */

let BASE_URL = 'http://localhost:3000';
let endpoints = [
    { name: 'GitHub Activity', path: '/api/github/activity', method: 'GET' },
    { name: 'GitHub Contributions', path: '/api/github/contributions', method: 'GET' },
    { name: 'GitHub Commits', path: '/api/github/commits', method: 'GET' },
    { name: 'GitHub Repo (remcostoeten.nl)', path: '/api/github/repo?owner=remcostoeten&repo=remcostoeten.nl', method: 'GET' },
    { name: 'Spotify Now Playing', path: '/api/spotify/now-playing', method: 'GET' },
    { name: 'Spotify Recent', path: '/api/spotify/recent', method: 'GET' },
];

async function loadConfig() {
    const configPath = './api-test.config.json';
    if (existsSync(configPath)) {
        try {
            const config = JSON.parse(await readFile(configPath, 'utf8'));
            if (config.baseUrl) BASE_URL = config.baseUrl;
            if (config.endpoints) endpoints = config.endpoints;
        } catch (err) {
            console.log('\x1b[33mWarning: Could not load config file, using defaults\x1b[0m');
        }
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', '=== remcostoeten.nl API Tester ===');
    console.log('\x1b[90m%s\x1b[0m', 'Select an endpoint to fetch data and copy curl to clipboard\n');

    endpoints.forEach((ep, i) => {
        const method = ep.method || 'GET';
        console.log(`\x1b[33m${i + 1}\x1b[0m: ${ep.name} \x1b[90m${method} ${ep.path}\x1b[0m`);
    });

    console.log('\n\x1b[31mq\x1b[0m: Quit');
    rl.question('\n\x1b[1mSelection: \x1b[0m', handleInput);
}

async function handleInput(input) {
    if (input.toLowerCase() === 'q') {
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
    }

    const index = parseInt(input) - 1;
    if (isNaN(index) || index < 0 || index >= endpoints.length) {
        console.log('\n\x1b[31mInvalid selection. Try again.\x1b[0m');
        setTimeout(showMenu, 800);
        return;
    }

    const endpoint = endpoints[index];
    const url = BASE_URL + endpoint.path;
    const curlCmd = `curl -X GET "${url}" -H "Accept: application/json"`;

    function copyToClipboard(text) {
        const platform = process.platform;
        let command;

        if (platform === 'darwin') {
            command = `echo '${text}' | pbcopy`;
        } else if (platform === 'linux') {
            // Try xclip first, then wl-copy for Wayland
            command = `echo '${text}' | xclip -selection clipboard || echo '${text}' | wl-copy`;
        } else if (platform === 'win32') {
            command = `echo ${text} | clip`;
        }

        if (command) {
            exec(command, (err) => {
                if (!err) {
                    console.log('\x1b[32m✓ Curl command copied to clipboard\x1b[0m');
                }
            });
        }
    }

    copyToClipboard(curlCmd);
    console.log(`\x1b[33mFetching:\x1b[0m ${url}`);

    try {
        const startTime = Date.now();
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'api-test.mjs/1.0'
            }
        });
        const duration = Date.now() - startTime;

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${res.statusText}\nResponse: ${errorText.substring(0, 200)}...`);
        }

        const contentType = res.headers.get('content-type');
        let data;
        
        if (contentType?.includes('application/json')) {
            data = await res.json();
        } else {
            data = await res.text();
        }

        console.log(`\x1b[32mStatus:\x1b[0m ${res.status} OK \x1b[90m(${duration}ms)\x1b[0m`);
        console.log(`\x1b[36mContent-Type:\x1b[0m ${contentType || 'unknown'}`);
        console.log(`\x1b[33m\nResponse Body:\x1b[0m`);
        
        if (typeof data === 'object') {
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(data);
        }
    } catch (err) {
        console.log(`\x1b[31m\nError:\x1b[0m ${err.message}`);
        if (err.code === 'ECONNREFUSED') {
            console.log(`\x1b[90mConnection refused. Make sure your Next.js server is running at ${BASE_URL}\x1b[0m`);
        } else {
            console.log(`\x1b[90mCheck your network connection and server status\x1b[0m`);
        }
    }

    console.log(`\x1b[90m\n--------------------------------------------------\x1b[0m`);
    rl.question('Press Enter to return to menu...', () => {
        showMenu();
    });
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    process.exit(0);
});

async function start() {
    await loadConfig();
    showMenu();
}

start();
