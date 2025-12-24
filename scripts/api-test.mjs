#!/usr/bin/env node

/**
 * API Testing Utility v4.0
 * 
 * A standalone, project-agnostic CLI tool for testing APIs and GitHub repositories.
 * 
 * Features:
 * - Query any GitHub user/repository
 * - Token validation and rate limit checking
 * - Interactive repository selection via GitHub CLI
 * - Vim keybindings support
 * - Environment variable support (.env, global)
 * - Comprehensive error handling
 * 
 * Usage:
 *   node api-test.mjs                    # Interactive mode
 *   node api-test.mjs --help             # Show help
 *   node api-test.mjs --user <username>  # Query specific user
 *   node api-test.mjs --repo <owner/repo># Query specific repo
 *   node api-test.mjs --check-token      # Validate GitHub token
 *   node api-test.mjs --gh-repos         # Interactive repo selection via gh CLI
 */

import readline from 'readline';
import { exec, execSync, spawn } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// =============================================================================
// Configuration
// =============================================================================

const VERSION = '4.0.0';
const TOOL_NAME = 'api-test';

// ANSI color codes
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    underline: '\x1b[4m',
    inverse: '\x1b[7m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
};

// Box drawing
const box = { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' };

// Default configuration
let config = {
    baseUrl: 'http://localhost:3000',
    githubToken: null,
    githubUser: null,
    endpoints: [
        { name: 'GitHub Activity', path: '/api/github/activity', method: 'GET' },
        { name: 'GitHub Contributions', path: '/api/github/contributions', method: 'GET' },
        { name: 'GitHub Commits', path: '/api/github/commits', method: 'GET' },
        { name: 'Spotify Now Playing', path: '/api/spotify/now-playing', method: 'GET' },
        { name: 'Spotify Recent', path: '/api/spotify/recent', method: 'GET' },
    ],
};

const history = [];
const OUTPUT_DIR = '.api-test-output';

// =============================================================================
// Utilities
// =============================================================================

function drawSeparator(width = 70) {
    console.log(`${c.dim}${box.h.repeat(width)}${c.reset}`);
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(ms) {
    if (ms < 100) return `${c.green}${ms}ms${c.reset}`;
    if (ms < 500) return `${c.yellow}${ms}ms${c.reset}`;
    return `${c.red}${ms}ms${c.reset}`;
}

function getStatusColor(status) {
    if (status >= 200 && status < 300) return c.green;
    if (status >= 300 && status < 400) return c.yellow;
    if (status >= 400 && status < 500) return c.red;
    return c.magenta;
}

// =============================================================================
// Environment & Token Handling
// =============================================================================

async function loadEnvFile(path) {
    try {
        if (!existsSync(path)) return {};
        const content = await readFile(path, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch {
        return {};
    }
}

async function loadConfig() {
    // Load from multiple sources (priority: CLI args > .env.local > .env > global)
    const sources = [
        './.env.local',
        './.env',
        `${process.env.HOME}/.config/api-test/.env`,
    ];

    for (const source of sources) {
        const env = await loadEnvFile(source);
        if (env.GITHUB_TOKEN && !config.githubToken) {
            config.githubToken = env.GITHUB_TOKEN;
        }
        if (env.GITHUB_USER && !config.githubUser) {
            config.githubUser = env.GITHUB_USER;
        }
        if (env.API_BASE_URL) {
            config.baseUrl = env.API_BASE_URL;
        }
    }

    // Also check process.env
    config.githubToken = config.githubToken || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    config.githubUser = config.githubUser || process.env.GITHUB_USER;

    // Load custom config file
    const configPath = './api-test.config.json';
    if (existsSync(configPath)) {
        try {
            const customConfig = JSON.parse(await readFile(configPath, 'utf8'));
            if (customConfig.baseUrl) config.baseUrl = customConfig.baseUrl;
            if (customConfig.endpoints) config.endpoints = customConfig.endpoints;
            if (customConfig.githubUser) config.githubUser = customConfig.githubUser;
        } catch (err) {
            console.log(`${c.yellow}Warning: Could not parse config file${c.reset}`);
        }
    }
}

async function validateGitHubToken() {
    if (!config.githubToken) {
        return { valid: false, error: 'No token configured' };
    }

    try {
        const res = await fetch('https://api.github.com/rate_limit', {
            headers: {
                'Authorization': `Bearer ${config.githubToken}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': `${TOOL_NAME}/${VERSION}`
            }
        });

        if (res.status === 401) {
            return { valid: false, error: 'Invalid or expired token' };
        }

        const data = await res.json();
        const core = data.resources?.core || {};

        return {
            valid: true,
            remaining: core.remaining,
            limit: core.limit,
            reset: new Date(core.reset * 1000).toLocaleTimeString(),
            isRateLimited: core.remaining === 0
        };
    } catch (err) {
        return { valid: false, error: err.message };
    }
}

async function checkGitHubUser(username) {
    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': `${TOOL_NAME}/${VERSION}`
    };

    if (config.githubToken) {
        headers['Authorization'] = `Bearer ${config.githubToken}`;
    }

    try {
        const res = await fetch(`https://api.github.com/users/${username}`, { headers });

        if (res.status === 404) {
            return { exists: false, error: `User '${username}' not found` };
        }

        if (res.status === 403) {
            return { exists: false, error: 'Rate limited. Add a GitHub token for more requests.' };
        }

        const data = await res.json();
        return {
            exists: true,
            user: {
                login: data.login,
                name: data.name,
                publicRepos: data.public_repos,
                followers: data.followers,
                url: data.html_url
            }
        };
    } catch (err) {
        return { exists: false, error: err.message };
    }
}

async function fetchGitHubRepo(owner, repo) {
    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': `${TOOL_NAME}/${VERSION}`
    };

    if (config.githubToken) {
        headers['Authorization'] = `Bearer ${config.githubToken}`;
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

        if (res.status === 404) {
            return { success: false, error: `Repository '${owner}/${repo}' not found` };
        }

        if (res.status === 403) {
            return { success: false, error: 'Rate limited. Add a GitHub token for more requests.' };
        }

        const data = await res.json();
        return {
            success: true,
            repo: {
                name: data.name,
                fullName: data.full_name,
                description: data.description,
                stars: data.stargazers_count,
                forks: data.forks_count,
                language: data.language,
                isPrivate: data.private,
                url: data.html_url,
                defaultBranch: data.default_branch,
                topics: data.topics || [],
                updatedAt: data.updated_at
            }
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// =============================================================================
// GitHub CLI Integration
// =============================================================================

function isGhInstalled() {
    try {
        execSync('gh --version', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function isGhAuthenticated() {
    try {
        execSync('gh auth status', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

async function fetchGhRepos() {
    return new Promise((resolve, reject) => {
        exec('gh repo list --json name,description,isPrivate,stargazerCount,url --limit 100', (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr || err.message));
                return;
            }
            try {
                const repos = JSON.parse(stdout);
                resolve(repos);
            } catch (e) {
                reject(new Error('Failed to parse gh output'));
            }
        });
    });
}

// =============================================================================
// Interactive Repository Selector
// =============================================================================

async function interactiveRepoSelector(repos) {
    return new Promise((resolve) => {
        let selectedIndex = 0;
        let searchQuery = '';
        let filteredRepos = [...repos];

        const stdin = process.stdin;
        const stdout = process.stdout;

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        function filterRepos() {
            if (!searchQuery) {
                filteredRepos = [...repos];
            } else {
                const q = searchQuery.toLowerCase();
                filteredRepos = repos.filter(r =>
                    r.name.toLowerCase().includes(q) ||
                    (r.description && r.description.toLowerCase().includes(q))
                );
            }
            selectedIndex = Math.min(selectedIndex, Math.max(0, filteredRepos.length - 1));
        }

        function render() {
            console.clear();
            console.log(`\n${c.cyan}${c.bold}Select Repository${c.reset}`);
            console.log(`${c.dim}Type to search, arrows/j/k to navigate, Enter to select, q to cancel${c.reset}\n`);

            if (searchQuery) {
                console.log(`${c.yellow}Search: ${searchQuery}${c.reset}\n`);
            }

            drawSeparator(60);

            const maxVisible = 15;
            const start = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
            const end = Math.min(filteredRepos.length, start + maxVisible);

            if (filteredRepos.length === 0) {
                console.log(`${c.dim}  No repositories match your search${c.reset}`);
            }

            for (let i = start; i < end; i++) {
                const repo = filteredRepos[i];
                const isSelected = i === selectedIndex;
                const prefix = isSelected ? `${c.cyan}> ` : '  ';
                const name = isSelected ? `${c.bold}${repo.name}${c.reset}` : repo.name;
                const stars = repo.stargazerCount > 0 ? ` ${c.yellow}*${repo.stargazerCount}${c.reset}` : '';
                const priv = repo.isPrivate ? ` ${c.dim}[private]${c.reset}` : '';

                console.log(`${prefix}${name}${stars}${priv}${c.reset}`);

                if (isSelected && repo.description) {
                    console.log(`    ${c.dim}${repo.description.substring(0, 55)}${repo.description.length > 55 ? '...' : ''}${c.reset}`);
                }
            }

            drawSeparator(60);
            console.log(`${c.dim}${filteredRepos.length}/${repos.length} repos${c.reset}`);
        }

        render();

        stdin.on('data', (key) => {
            // Ctrl+C or q
            if (key === '\u0003' || key === 'q') {
                stdin.setRawMode(false);
                stdin.pause();
                console.clear();
                resolve(null);
                return;
            }

            // Enter
            if (key === '\r' || key === '\n') {
                stdin.setRawMode(false);
                stdin.pause();
                console.clear();
                resolve(filteredRepos[selectedIndex] || null);
                return;
            }

            // Backspace
            if (key === '\u007F') {
                searchQuery = searchQuery.slice(0, -1);
                filterRepos();
                render();
                return;
            }

            // Arrow up or k (vim)
            if (key === '\u001B[A' || key === 'k') {
                selectedIndex = Math.max(0, selectedIndex - 1);
                render();
                return;
            }

            // Arrow down or j (vim)
            if (key === '\u001B[B' || key === 'j') {
                selectedIndex = Math.min(filteredRepos.length - 1, selectedIndex + 1);
                render();
                return;
            }

            // Page up or Ctrl+U
            if (key === '\u001B[5~' || key === '\u0015') {
                selectedIndex = Math.max(0, selectedIndex - 10);
                render();
                return;
            }

            // Page down or Ctrl+D
            if (key === '\u001B[6~' || key === '\u0004') {
                selectedIndex = Math.min(filteredRepos.length - 1, selectedIndex + 10);
                render();
                return;
            }

            // Home or gg (vim-like: just g for simplicity)
            if (key === 'g') {
                selectedIndex = 0;
                render();
                return;
            }

            // End or G (vim)
            if (key === 'G') {
                selectedIndex = filteredRepos.length - 1;
                render();
                return;
            }

            // Escape - clear search
            if (key === '\u001B') {
                searchQuery = '';
                filterRepos();
                render();
                return;
            }

            // Regular character - add to search
            if (key.length === 1 && key.match(/[a-zA-Z0-9\-_\.]/)) {
                searchQuery += key;
                filterRepos();
                render();
                return;
            }
        });
    });
}

// =============================================================================
// Help & CLI Args
// =============================================================================

function showHelp() {
    console.log(`
${c.cyan}${c.bold}${TOOL_NAME} v${VERSION}${c.reset}
${c.dim}A standalone CLI tool for testing APIs and GitHub repositories${c.reset}

${c.yellow}${c.bold}USAGE${c.reset}
  ${TOOL_NAME} [options]

${c.yellow}${c.bold}OPTIONS${c.reset}
  ${c.green}-h, --help${c.reset}              Show this help message
  ${c.green}-v, --version${c.reset}           Show version
  ${c.green}--check-token${c.reset}           Validate GitHub token and show rate limits
  ${c.green}--user <username>${c.reset}       Query a specific GitHub user
  ${c.green}--repo <owner/repo>${c.reset}     Query a specific repository
  ${c.green}--gh-repos${c.reset}              Interactive repository selector (requires gh CLI)
  ${c.green}--base-url <url>${c.reset}        Override base URL for API endpoints
  ${c.green}--all${c.reset}                   Run all configured endpoints

${c.yellow}${c.bold}ENVIRONMENT VARIABLES${c.reset}
  ${c.cyan}GITHUB_TOKEN${c.reset}            GitHub personal access token
  ${c.cyan}GH_TOKEN${c.reset}                GitHub token (alternative)
  ${c.cyan}GITHUB_USER${c.reset}             Default GitHub username
  ${c.cyan}API_BASE_URL${c.reset}            Base URL for API endpoints

${c.yellow}${c.bold}CONFIGURATION FILES${c.reset}
  ${c.dim}Priority order (highest first):${c.reset}
  1. Command line arguments
  2. .env.local (project)
  3. .env (project)
  4. ~/.config/${TOOL_NAME}/.env (global)
  5. api-test.config.json (custom endpoints)

${c.yellow}${c.bold}INTERACTIVE CONTROLS${c.reset}
  ${c.dim}Repository selector:${c.reset}
  ${c.cyan}j/k or arrows${c.reset}           Navigate up/down
  ${c.cyan}g/G${c.reset}                     Jump to top/bottom
  ${c.cyan}Ctrl+U/D${c.reset}                Page up/down
  ${c.cyan}Type${c.reset}                    Filter by name
  ${c.cyan}Enter${c.reset}                   Select
  ${c.cyan}q or Ctrl+C${c.reset}             Cancel

${c.yellow}${c.bold}EXAMPLES${c.reset}
  ${c.dim}# Check if your token is valid${c.reset}
  ${TOOL_NAME} --check-token

  ${c.dim}# Query a GitHub user${c.reset}
  ${TOOL_NAME} --user octocat

  ${c.dim}# Query a specific repository${c.reset}
  ${TOOL_NAME} --repo vercel/next.js

  ${c.dim}# Interactive repo selection (requires gh CLI)${c.reset}
  ${TOOL_NAME} --gh-repos

  ${c.dim}# Run all API endpoints${c.reset}
  ${TOOL_NAME} --all
`);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = { command: 'interactive' };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-h' || arg === '--help') {
            parsed.command = 'help';
        } else if (arg === '-v' || arg === '--version') {
            parsed.command = 'version';
        } else if (arg === '--check-token') {
            parsed.command = 'check-token';
        } else if (arg === '--user') {
            parsed.command = 'user';
            parsed.username = args[++i];
        } else if (arg === '--repo') {
            parsed.command = 'repo';
            parsed.repo = args[++i];
        } else if (arg === '--gh-repos') {
            parsed.command = 'gh-repos';
        } else if (arg === '--base-url') {
            config.baseUrl = args[++i];
        } else if (arg === '--all') {
            parsed.command = 'all';
        }
    }

    return parsed;
}

// =============================================================================
// Command Handlers
// =============================================================================

async function handleCheckToken() {
    console.log(`\n${c.cyan}${c.bold}GitHub Token Status${c.reset}\n`);

    const result = await validateGitHubToken();

    if (!result.valid) {
        console.log(`${c.red}[INVALID]${c.reset} ${result.error}`);
        console.log(`\n${c.dim}To configure a token:${c.reset}`);
        console.log(`  1. Create a token at https://github.com/settings/tokens`);
        console.log(`  2. Add to .env: GITHUB_TOKEN=your_token`);
        console.log(`  3. Or export: export GITHUB_TOKEN=your_token`);
        return;
    }

    if (result.isRateLimited) {
        console.log(`${c.yellow}[RATE LIMITED]${c.reset}`);
        console.log(`  Resets at: ${result.reset}`);
    } else {
        console.log(`${c.green}[VALID]${c.reset}`);
        console.log(`  Remaining: ${result.remaining}/${result.limit} requests`);
        console.log(`  Resets at: ${result.reset}`);
    }
}

async function handleQueryUser(username) {
    if (!username) {
        console.log(`${c.red}Error: Username required${c.reset}`);
        console.log(`Usage: ${TOOL_NAME} --user <username>`);
        return;
    }

    console.log(`\n${c.cyan}Querying user: ${username}${c.reset}\n`);

    const result = await checkGitHubUser(username);

    if (!result.exists) {
        console.log(`${c.red}[NOT FOUND]${c.reset} ${result.error}`);
        return;
    }

    const u = result.user;
    console.log(`${c.green}[FOUND]${c.reset}`);
    drawSeparator(50);
    console.log(`  ${c.bold}${u.name || u.login}${c.reset} (@${u.login})`);
    console.log(`  ${c.dim}Repos: ${u.publicRepos} | Followers: ${u.followers}${c.reset}`);
    console.log(`  ${c.cyan}${u.url}${c.reset}`);
    drawSeparator(50);
}

async function handleQueryRepo(repoPath) {
    if (!repoPath || !repoPath.includes('/')) {
        console.log(`${c.red}Error: Repository path required (format: owner/repo)${c.reset}`);
        console.log(`Usage: ${TOOL_NAME} --repo owner/repo`);
        return;
    }

    const [owner, repo] = repoPath.split('/');
    console.log(`\n${c.cyan}Querying repository: ${owner}/${repo}${c.reset}\n`);

    const result = await fetchGitHubRepo(owner, repo);

    if (!result.success) {
        console.log(`${c.red}[NOT FOUND]${c.reset} ${result.error}`);
        return;
    }

    const r = result.repo;
    console.log(`${c.green}[FOUND]${c.reset}`);
    drawSeparator(60);
    console.log(`  ${c.bold}${r.fullName}${c.reset}${r.isPrivate ? ` ${c.yellow}[private]${c.reset}` : ''}`);
    if (r.description) {
        console.log(`  ${c.dim}${r.description}${c.reset}`);
    }
    console.log();
    console.log(`  ${c.yellow}Stars: ${r.stars}${c.reset}  |  Forks: ${r.forks}  |  ${r.language || 'No language'}`);
    if (r.topics.length > 0) {
        console.log(`  ${c.cyan}Topics: ${r.topics.slice(0, 5).join(', ')}${r.topics.length > 5 ? '...' : ''}${c.reset}`);
    }
    console.log(`  ${c.dim}Default branch: ${r.defaultBranch}${c.reset}`);
    console.log(`  ${c.dim}Updated: ${new Date(r.updatedAt).toLocaleDateString()}${c.reset}`);
    console.log(`  ${c.cyan}${r.url}${c.reset}`);
    drawSeparator(60);
}

async function handleGhRepos() {
    if (!isGhInstalled()) {
        console.log(`${c.red}Error: GitHub CLI (gh) is not installed${c.reset}`);
        console.log(`\n${c.dim}Install it from: https://cli.github.com/${c.reset}`);
        return;
    }

    if (!isGhAuthenticated()) {
        console.log(`${c.red}Error: GitHub CLI is not authenticated${c.reset}`);
        console.log(`\n${c.dim}Run: gh auth login${c.reset}`);
        return;
    }

    console.log(`${c.dim}Fetching repositories...${c.reset}`);

    try {
        const repos = await fetchGhRepos();

        if (repos.length === 0) {
            console.log(`${c.yellow}No repositories found${c.reset}`);
            return;
        }

        const selected = await interactiveRepoSelector(repos);

        if (selected) {
            console.log(`\n${c.green}Selected:${c.reset} ${c.bold}${selected.name}${c.reset}`);
            if (selected.url) {
                console.log(`${c.cyan}${selected.url}${c.reset}`);
            }

            // Fetch full details
            const owner = selected.url.split('/').slice(-2, -1)[0];
            await handleQueryRepo(`${owner}/${selected.name}`);
        }
    } catch (err) {
        console.log(`${c.red}Error: ${err.message}${c.reset}`);
    }
}

// =============================================================================
// API Testing (original functionality)
// =============================================================================

async function runEndpoint(endpoint, silent = false) {
    const url = config.baseUrl + endpoint.path;
    const curlCmd = `curl -X ${endpoint.method || 'GET'} "${url}" -H "Accept: application/json"`;

    if (!silent) {
        copyToClipboard(curlCmd);
        console.log(`\n${c.cyan}${c.bold}${endpoint.name}${c.reset}`);
        console.log(`${c.dim}${endpoint.method || 'GET'} ${url}${c.reset}`);
        drawSeparator();
    }

    try {
        const startTime = Date.now();
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': `${TOOL_NAME}/${VERSION}`
            }
        });
        const duration = Date.now() - startTime;

        const rawBody = await res.text();
        const bodySize = new TextEncoder().encode(rawBody).length;

        let data;
        const contentType = res.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            try {
                data = JSON.parse(rawBody);
            } catch {
                data = rawBody;
            }
        } else {
            data = rawBody;
        }

        const statusColor = getStatusColor(res.status);
        const statusIcon = res.ok ? 'OK' : 'ERR';
        console.log(`\n${statusColor}${c.bold}[${statusIcon}]${c.reset} ${res.status} ${res.statusText}  ${formatDuration(duration)}  ${c.dim}${formatBytes(bodySize)}${c.reset}`);

        history.unshift({
            endpoint: endpoint.name,
            status: res.status,
            duration,
            size: bodySize,
            timestamp: new Date().toISOString(),
            success: res.ok
        });

        if (!res.ok) {
            console.log(`\n${c.red}Error Response:${c.reset}`);
            console.log(c.dim + rawBody.substring(0, 500) + c.reset);
            return { success: false, status: res.status, duration };
        }

        if (!silent && typeof data === 'object') {
            const preview = JSON.stringify(data, null, 2).split('\n').slice(0, 20).join('\n');
            console.log(`\n${c.cyan}Response:${c.reset}`);
            console.log(preview);
        }

        return { success: true, status: res.status, duration, size: bodySize };

    } catch (err) {
        console.log(`\n${c.red}${c.bold}[ERR]${c.reset} ${err.message}`);

        if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
            console.log(`${c.dim}Server not running at ${config.baseUrl}${c.reset}`);
            console.log(`${c.dim}Start with: pnpm dev${c.reset}`);
        }

        return { success: false, error: err.message };
    }
}

async function runAllEndpoints() {
    console.log(`\n${c.cyan}${c.bold}Running ${config.endpoints.length} endpoints...${c.reset}\n`);

    const results = [];
    const startTime = Date.now();

    for (const endpoint of config.endpoints) {
        const result = await runEndpoint(endpoint, true);
        results.push({ ...result, name: endpoint.name });

        const statusIcon = result.success ? `${c.green}[OK]${c.reset}` : `${c.red}[ERR]${c.reset}`;
        const timing = result.duration ? formatDuration(result.duration) : `${c.dim}---${c.reset}`;
        const status = result.status ? String(result.status).padStart(3) : 'ERR';

        console.log(`${statusIcon} ${status}  ${timing.padEnd(15)}  ${c.dim}${endpoint.name}${c.reset}`);
    }

    const totalTime = Date.now() - startTime;
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;

    console.log();
    drawSeparator();
    console.log(`${c.bold}Summary:${c.reset} ${c.green}${passed} passed${c.reset}${failed > 0 ? `, ${c.red}${failed} failed${c.reset}` : ''}`);
    console.log(`${c.dim}Total: ${totalTime}ms${c.reset}`);
}

function copyToClipboard(text) {
    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
        command = `echo '${text}' | pbcopy`;
    } else if (platform === 'linux') {
        command = `echo '${text}' | xclip -selection clipboard 2>/dev/null || echo '${text}' | wl-copy 2>/dev/null`;
    } else if (platform === 'win32') {
        command = `echo ${text} | clip`;
    }

    if (command) {
        exec(command, () => { });
    }
}

// =============================================================================
// Interactive Mode
// =============================================================================

function showInteractiveMenu(rl) {
    console.clear();

    console.log(`
${c.cyan}${c.bold}${TOOL_NAME} v${VERSION}${c.reset}
${c.dim}Base: ${config.baseUrl}${c.reset}
${c.dim}Token: ${config.githubToken ? c.green + 'configured' + c.reset : c.yellow + 'not set' + c.reset}${c.reset}
`);
    drawSeparator();

    console.log(`\n${c.bold}API Endpoints:${c.reset}\n`);
    config.endpoints.forEach((ep, i) => {
        const num = `${c.yellow}${c.bold}${String(i + 1).padStart(2)}${c.reset}`;
        console.log(`  ${num}  ${ep.name}`);
        console.log(`      ${c.dim}${ep.method || 'GET'} ${ep.path}${c.reset}\n`);
    });

    console.log(`${c.bold}GitHub:${c.reset}`);
    console.log(`  ${c.yellow}u${c.reset}   Query a GitHub user`);
    console.log(`  ${c.yellow}r${c.reset}   Query a repository`);
    console.log(`  ${c.yellow}g${c.reset}   Interactive repo selector (gh CLI)`);
    console.log(`  ${c.yellow}t${c.reset}   Check token status\n`);

    console.log(`${c.bold}Other:${c.reset}`);
    console.log(`  ${c.yellow}a${c.reset}   Run all endpoints`);
    console.log(`  ${c.yellow}h${c.reset}   View history (${history.length})`);
    console.log(`  ${c.yellow}?${c.reset}   Help`);
    console.log(`  ${c.red}q${c.reset}   Quit\n`);

    rl.question(`${c.bold}> ${c.reset}`, (input) => handleInteractiveInput(input, rl));
}

async function handleInteractiveInput(input, rl) {
    const cmd = input.toLowerCase().trim();

    if (cmd === 'q') {
        console.log(`\n${c.dim}Goodbye${c.reset}\n`);
        rl.close();
        process.exit(0);
    }

    if (cmd === '?') {
        showHelp();
        await waitForEnter(rl);
        showInteractiveMenu(rl);
        return;
    }

    if (cmd === 'a') {
        await runAllEndpoints();
        await waitForEnter(rl);
        showInteractiveMenu(rl);
        return;
    }

    if (cmd === 't') {
        await handleCheckToken();
        await waitForEnter(rl);
        showInteractiveMenu(rl);
        return;
    }

    if (cmd === 'u') {
        rl.question(`${c.cyan}Username: ${c.reset}`, async (username) => {
            await handleQueryUser(username);
            await waitForEnter(rl);
            showInteractiveMenu(rl);
        });
        return;
    }

    if (cmd === 'r') {
        rl.question(`${c.cyan}Repository (owner/repo): ${c.reset}`, async (repo) => {
            await handleQueryRepo(repo);
            await waitForEnter(rl);
            showInteractiveMenu(rl);
        });
        return;
    }

    if (cmd === 'g') {
        await handleGhRepos();
        await waitForEnter(rl);
        showInteractiveMenu(rl);
        return;
    }

    if (cmd === 'h') {
        showHistory();
        await waitForEnter(rl);
        showInteractiveMenu(rl);
        return;
    }

    const index = parseInt(input) - 1;
    if (!isNaN(index) && index >= 0 && index < config.endpoints.length) {
        await runEndpoint(config.endpoints[index]);
        await waitForEnter(rl);
        showInteractiveMenu(rl);
        return;
    }

    console.log(`\n${c.red}Invalid option${c.reset}`);
    setTimeout(() => showInteractiveMenu(rl), 500);
}

function showHistory() {
    console.log(`\n${c.cyan}${c.bold}Request History${c.reset}\n`);

    if (history.length === 0) {
        console.log(`${c.dim}No requests yet${c.reset}`);
        return;
    }

    history.slice(0, 15).forEach((req) => {
        const time = new Date(req.timestamp).toLocaleTimeString();
        const statusIcon = req.success ? `${c.green}[OK]${c.reset}` : `${c.red}[ERR]${c.reset}`;
        console.log(`${c.dim}${time}${c.reset}  ${statusIcon}  ${formatDuration(req.duration).padEnd(15)}  ${c.dim}${req.endpoint}${c.reset}`);
    });
}

function waitForEnter(rl) {
    return new Promise(resolve => {
        rl.question(`\n${c.dim}Press Enter...${c.reset}`, resolve);
    });
}

// =============================================================================
// Main
// =============================================================================

async function main() {
    await loadConfig();
    const args = parseArgs();

    switch (args.command) {
        case 'help':
            showHelp();
            break;

        case 'version':
            console.log(`${TOOL_NAME} v${VERSION}`);
            break;

        case 'check-token':
            await handleCheckToken();
            break;

        case 'user':
            await handleQueryUser(args.username);
            break;

        case 'repo':
            await handleQueryRepo(args.repo);
            break;

        case 'gh-repos':
            await handleGhRepos();
            break;

        case 'all':
            await runAllEndpoints();
            break;

        case 'interactive':
        default:
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.on('SIGINT', () => {
                console.log(`\n${c.dim}Goodbye${c.reset}\n`);
                process.exit(0);
            });

            showInteractiveMenu(rl);
            break;
    }
}

main().catch(err => {
    console.error(`${c.red}Error: ${err.message}${c.reset}`);
    process.exit(1);
});
