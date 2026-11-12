import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { z } from 'zod'

const ACCOUNT_ID = '4db795a1abab0cfed3b6178b6c57deb3'
const ZONE_NAME = 'remcostoeten.nl'
const API = 'https://api.cloudflare.com/client/v4'
const KV_DAILY_WRITE_LIMIT = 1000

const namespacesSchema = z.object({
	result: z.array(z.object({ id: z.string(), title: z.string() }))
})

const zonesSchema = z.object({
	result: z.array(z.object({ id: z.string() }))
})

const kvSchema = z.object({
	viewer: z.object({
		accounts: z.array(
			z.object({
				kvOperationsAdaptiveGroups: z.array(
					z.object({
						sum: z.object({ requests: z.number() }),
						dimensions: z.object({
							date: z.string(),
							namespaceId: z.string(),
							actionType: z.string()
						})
					})
				)
			})
		)
	})
})

const groupSchema = z.object({
	count: z.number(),
	dimensions: z.object({ label: z.string() })
})

const trafficSchema = z.object({
	viewer: z.object({
		zones: z.array(
			z.object({
				paths: z.array(groupSchema),
				agents: z.array(groupSchema),
				countries: z.array(groupSchema)
			})
		)
	})
})

function readToken() {
	if (process.env.CLOUDFLARE_API_TOKEN)
		return process.env.CLOUDFLARE_API_TOKEN

	const wranglerConfig = readFileSync(
		join(homedir(), '.config/.wrangler/config/default.toml'),
		'utf8'
	)
	const token = wranglerConfig.match(/^oauth_token = "([^"]+)"/m)?.[1]
	if (!token) {
		throw new Error(
			'Set CLOUDFLARE_API_TOKEN or run `bunx wrangler login` first.'
		)
	}
	return token
}

async function request<Output>(
	token: string,
	path: string,
	schema: z.ZodType<Output>,
	body?: string
): Promise<Output> {
	const response = await fetch(`${API}${path}`, {
		method: body ? 'POST' : 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body
	})
	if (!response.ok) {
		throw new Error(`${path} answered ${response.status}`)
	}
	return schema.parse(await response.json())
}

async function graphql<Output>(
	token: string,
	query: string,
	variables: Record<string, string>,
	schema: z.ZodType<Output>
): Promise<Output> {
	const envelope = z.object({
		data: schema.nullable(),
		errors: z.array(z.object({ message: z.string() })).nullish()
	})
	const parsed = await request(
		token,
		'/graphql',
		envelope,
		JSON.stringify({ query, variables })
	)
	if (parsed.errors?.length || parsed.data === null) {
		const messages = parsed.errors?.map(error => error.message) ?? []
		throw new Error(messages.join('\n') || 'GraphQL returned no data')
	}
	return parsed.data
}

function daysAgo(days: number) {
	const date = new Date()
	date.setUTCDate(date.getUTCDate() - days)
	return date.toISOString().slice(0, 10)
}

async function printKvUsage(token: string, days: number) {
	const namespaces = await request(
		token,
		`/accounts/${ACCOUNT_ID}/storage/kv/namespaces`,
		namespacesSchema
	)
	const titles = new Map(
		namespaces.result.map(namespace => [namespace.id, namespace.title])
	)

	const data = await graphql(
		token,
		`query($account: String!, $start: Date!, $end: Date!) {
				viewer { accounts(filter: { accountTag: $account }) {
					kvOperationsAdaptiveGroups(limit: 1000, filter: { date_geq: $start, date_leq: $end }, orderBy: [date_ASC]) {
						sum { requests }
						dimensions { date namespaceId actionType }
					}
				} }
			}`,
		{ account: ACCOUNT_ID, start: daysAgo(days - 1), end: daysAgo(0) },
		kvSchema
	)

	const rows = data.viewer.accounts[0]?.kvOperationsAdaptiveGroups ?? []
	const writes = rows.filter(row => row.dimensions.actionType === 'write')

	console.log(
		`\nKV writes per day (free limit ${KV_DAILY_WRITE_LIMIT} per account)`
	)
	const dates = [...new Set(writes.map(row => row.dimensions.date))]
	for (const date of dates) {
		const day = writes.filter(row => row.dimensions.date === date)
		const total = day.reduce((sum, row) => sum + row.sum.requests, 0)
		const parts = day
			.map(
				row =>
					`${titles.get(row.dimensions.namespaceId) ?? row.dimensions.namespaceId}: ${row.sum.requests}`
			)
			.join(', ')
		const marker = total >= KV_DAILY_WRITE_LIMIT ? '  OVER LIMIT' : ''
		console.log(
			`  ${date}  ${String(total).padStart(5)}  ${parts}${marker}`
		)
	}
}

function printGroups(title: string, groups: z.infer<typeof groupSchema>[]) {
	console.log(`\n${title}`)
	for (const group of groups) {
		const label = (group.dimensions.label || '(empty)').slice(0, 110)
		console.log(`  ${String(group.count).padStart(6)}  ${label}`)
	}
}

async function printTraffic(token: string) {
	const zones = await request(token, `/zones?name=${ZONE_NAME}`, zonesSchema)
	const zone = zones.result[0]?.id
	if (!zone) throw new Error(`Zone ${ZONE_NAME} not found`)

	const end = new Date()
	const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
	const filter =
		'{ datetime_geq: $start, datetime_leq: $end, requestSource: "eyeball" }'

	const data = await graphql(
		token,
		`query($zone: String!, $start: Time!, $end: Time!) {
				viewer { zones(filter: { zoneTag: $zone }) {
					paths: httpRequestsAdaptiveGroups(limit: 15, filter: ${filter}, orderBy: [count_DESC]) { count dimensions { label: clientRequestPath } }
					agents: httpRequestsAdaptiveGroups(limit: 15, filter: ${filter}, orderBy: [count_DESC]) { count dimensions { label: userAgent } }
					countries: httpRequestsAdaptiveGroups(limit: 10, filter: ${filter}, orderBy: [count_DESC]) { count dimensions { label: clientCountryName } }
				} }
			}`,
		{ zone, start: start.toISOString(), end: end.toISOString() },
		trafficSchema
	)

	const traffic = data.viewer.zones[0]
	if (!traffic) return

	printGroups('Top paths, last 24h', traffic.paths)
	printGroups('Top user agents, last 24h', traffic.agents)
	printGroups('Top countries, last 24h', traffic.countries)
}

async function main() {
	const days = Number(process.argv[2] ?? 7)
	const token = readToken()
	await printKvUsage(token, days)
	await printTraffic(token)
}

await main()
