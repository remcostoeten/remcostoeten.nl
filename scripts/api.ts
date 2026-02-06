#!/usr/bin/env bun
import readline from 'readline'
import { exec } from 'child_process'
import { db } from '../src/server/db/connection'
import * as authSchema from '../src/server/db/auth-schema'
import { sql } from 'drizzle-orm'

/**
 * remcostoeten.nl Unified API CLI
 *
 * Consolidates functionality for testing endpoints,
 * checking database status, and debugging users.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const endpoints = [
	{ name: 'GitHub Activity', path: '/api/github/activity', method: 'GET' },
	{
		name: 'GitHub Contributions',
		path: '/api/github/contributions',
		method: 'GET'
	},
	{ name: 'GitHub Commits', path: '/api/github/commits', method: 'GET' },
	{
		name: 'GitHub Repo (remcostoeten.nl)',
		path: '/api/github/repo?owner=remcostoeten&repo=remcostoeten.nl',
		method: 'GET'
	},
	{
		name: 'Spotify Now Playing',
		path: '/api/spotify/now-playing',
		method: 'GET'
	},
	{ name: 'Spotify Recent', path: '/api/spotify/recent', method: 'GET' }
]

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

function showMenu() {
	console.clear()
	console.log('\x1b[36m%s\x1b[0m', '=== remcostoeten.nl Unified CLI ===')
	console.log('\x1b[32m%s\x1b[0m', '--- Database Operations ---')
	console.log('\x1b[33m1\x1b[0m: List Users (Debug)')
	console.log('\x1b[33m2\x1b[0m: Check Sync Status')

	console.log('\n\x1b[32m%s\x1b[0m', '--- API Endpoint Testing ---')
	endpoints.forEach((ep, i) => {
		const index = i + 3
		console.log(
			`\x1b[33m${index}\x1b[0m: ${ep.name} \x1b[90m${ep.path}\x1b[0m`
		)
	})

	console.log('\n\x1b[31mq\x1b[0m: Quit')
	rl.question('\n\x1b[1mSelection: \x1b[0m', handleInput)
}

async function handleInput(input: string) {
	if (input.toLowerCase() === 'q') {
		console.log('Goodbye!')
		rl.close()
		process.exit(0)
	}

	const index = parseInt(input)

	if (index === 1) {
		await listUsers()
	} else if (index === 2) {
		await checkSyncStatus()
	} else if (index >= 3 && index < endpoints.length + 3) {
		await testEndpoint(endpoints[index - 3])
	} else {
		console.log('\n\x1b[31mInvalid selection. Try again.\x1b[0m')
		setTimeout(showMenu, 800)
		return
	}

	console.log(
		`\x1b[90m\n--------------------------------------------------\x1b[0m`
	)
	rl.question('Press Enter to return to menu...', () => {
		showMenu()
	})
}

async function listUsers() {
	console.log('\n\x1b[36mQuerying users...\x1b[0m')
	try {
		const users = await db.select().from(authSchema.user)
		console.log(`\x1b[32mUsers found:\x1b[0m ${users.length}\n`)
		users.forEach(u => {
			console.log(
				`- \x1b[1m${u.email}\x1b[0m (Name: ${u.name}, Role: ${u.role})`
			)
		})
	} catch (e) {
		console.error('\n\x1b[31mError querying users:\x1b[0m', e)
	}
}

async function checkSyncStatus() {
	console.log('\n\x1b[36mChecking sync status...\x1b[0m')
	try {
		const githubRes = await db.execute(
			sql`SELECT count(*) FROM github_activities`
		)
		const spotifyRes = await db.execute(
			sql`SELECT count(*) FROM spotify_listens`
		)
		const metaRes = await db.execute(sql`SELECT * FROM sync_metadata`)

		const githubCount = (githubRes.rows[0] as any)?.count || 0
		const spotifyCount = (spotifyRes.rows[0] as any)?.count || 0

		console.log(`- GitHub Activities: \x1b[33m${githubCount}\x1b[0m`)
		console.log(`- Spotify Listens:    \x1b[33m${spotifyCount}\x1b[0m`)

		if (metaRes.rows.length > 0) {
			console.log('\n📅 Last Sync Times:')
			console.table(metaRes.rows)
		} else {
			console.log('\n📅 No sync metadata found yet.')
		}
	} catch (e) {
		console.error('\n\x1b[31mError checking status:\x1b[0m', e)
	}
}

async function testEndpoint(endpoint: (typeof endpoints)[0]) {
	const url = BASE_URL + endpoint.path
	console.log(`\n\x1b[33mTesting:\x1b[0m ${url}`)

	try {
		const startTime = Date.now()
		const res = await fetch(url, {
			headers: { Accept: 'application/json' }
		})
		const duration = Date.now() - startTime

		if (!res.ok) {
			const errorText = await res.text()
			throw new Error(
				`HTTP ${res.status}: ${res.statusText}\n${errorText.substring(0, 100)}`
			)
		}

		const data = await res.json()
		console.log(
			`\x1b[32mStatus:\x1b[0m ${res.status} OK \x1b[90m(${duration}ms)\x1b[0m`
		)
		console.log(`\x1b[33mResponse snippet:\x1b[0m`)
		console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...')

		// Copy curl to clipboard
		const curlCmd = `curl -X GET "${url}" -H "Accept: application/json"`
		const platform = process.platform
		let command = ''
		if (platform === 'darwin') command = `echo '${curlCmd}' | pbcopy`
		else if (platform === 'linux')
			command = `echo '${curlCmd}' | xclip -selection clipboard || echo '${curlCmd}' | wl-copy`

		if (command) {
			exec(command, err => {
				if (!err)
					console.log(
						'\x1b[90m(Curl command copied to clipboard)\x1b[0m'
					)
			})
		}
	} catch (err: any) {
		console.log(`\x1b[31m\nError:\x1b[0m ${err.message}`)
	}
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
	console.log('\nGoodbye!')
	process.exit(0)
})

showMenu()
