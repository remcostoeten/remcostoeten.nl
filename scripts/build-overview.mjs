import { spawn } from 'node:child_process'

const COLORS = {
	bold: '\x1b[1m',
	reset: '\x1b[0m',
	dim: '\x1b[2m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m'
}

const BOX_WIDTH = 64
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const CHECK = '✓'
const CROSS = '✗'
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'gu')
const PACKAGE_RUNNER = { command: 'bun', args: ['run'] }
const BUILD_ENV = {
	DATABASE_URL: 'https://example.com',
	BETTER_AUTH_URL: 'http://localhost:3000',
	BETTER_AUTH_SECRET: 'ci-build-secret-ci-build-secret-ci-build-secret'
}

const steps = [
	{ label: 'Lint', script: 'lint' },
	{ label: 'Typecheck', script: 'typecheck' },
	{ label: 'Tests', script: 'test' },
	{ label: 'Build', script: 'build:next' }
]

const results = []
const startedAt = Date.now()
let spinnerIndex = 0

function formatDuration(ms) {
	if (ms < 1000) return `${ms}ms`
	return `${(ms / 1000).toFixed(1)}s`
}

function rule(char = '─', len = BOX_WIDTH) {
	return char.repeat(len)
}

function center(text, width = BOX_WIDTH) {
	return text.padStart(Math.floor((width + text.length) / 2)).padEnd(width)
}

function line(content = '', width = BOX_WIDTH) {
	return `${COLORS.cyan}│${COLORS.reset}${content.padEnd(width)}${COLORS.cyan}│${COLORS.reset}`
}

function stripAnsi(value) {
	return value.replace(ANSI_PATTERN, '')
}

function lineWithAnsi(content, width = BOX_WIDTH) {
	const visibleLength = stripAnsi(content).length
	return line(content + ' '.repeat(Math.max(0, width - visibleLength)), width)
}

function printBanner() {
	const title = '🚀 Release Build'
	const subtitle = 'lint → typecheck → test → build'

	console.log('')
	console.log(COLORS.cyan + '┌' + rule('─') + '┐' + COLORS.reset)
	console.log(line(`${COLORS.bold}${center(title)}${COLORS.reset}`))
	console.log(line(`${COLORS.dim}${center(subtitle)}${COLORS.reset}`))
	console.log(COLORS.cyan + '└' + rule('─') + '┘' + COLORS.reset)
	console.log('')
}

function printStepStart(index, total, label) {
	spinnerIndex = 0
	const frame = SPINNER_FRAMES[spinnerIndex % SPINNER_FRAMES.length]
	console.log(
		`${COLORS.cyan}${frame}${COLORS.reset} ${COLORS.bold}${index}/${total}${COLORS.reset} ${COLORS.white}${label}${COLORS.reset}`
	)
}

function printStepEnd(label, ok, duration) {
	const icon = ok ? COLORS.green + CHECK : COLORS.red + CROSS
	const status = ok ? COLORS.green + 'done' : COLORS.red + 'failed'

	console.log(
		`         ${icon}${COLORS.reset} ${COLORS.bold}${label}${COLORS.reset} ${COLORS.dim}${status} ${COLORS.white}${formatDuration(duration)}${COLORS.reset}`
	)
	console.log('')
}

function printSummary(success) {
	const totalDuration = Date.now() - startedAt
	const summaryTitle = success ? ' ✅ Build Complete ' : ' ❌ Build Failed '

	console.log(COLORS.cyan + '┌' + rule('─') + '┐' + COLORS.reset)
	console.log(line(`${COLORS.bold}${center(summaryTitle)}${COLORS.reset}`))
	console.log(COLORS.cyan + '├' + rule('─') + '┤' + COLORS.reset)

	for (const result of results) {
		const icon = result.ok
			? `${COLORS.green}${CHECK}`
			: `${COLORS.red}${CROSS}`
		const label = result.ok ? COLORS.green : COLORS.red
		const duration = formatDuration(result.duration).padStart(10)
		const content = ` ${icon}${COLORS.reset} ${label}${result.label.padEnd(14)}${COLORS.reset}${COLORS.dim}${duration}${COLORS.reset} `

		console.log(lineWithAnsi(content))
	}

	console.log(COLORS.cyan + '├' + rule('─') + '┤' + COLORS.reset)

	const totalLabel = success ? 'Total time' : 'Failed at'
	const totalTime = formatDuration(totalDuration)
	const footer = `  ${COLORS.bold}${totalLabel}${COLORS.reset}${COLORS.white}${totalTime.padStart(BOX_WIDTH - totalLabel.length - 2)}${COLORS.reset}`

	console.log(lineWithAnsi(footer))
	console.log(COLORS.cyan + '└' + rule('─') + '┘' + COLORS.reset)
	console.log('')
}

function runStep(step, index, total) {
	return new Promise((resolve, reject) => {
		printStepStart(index, total, step.label)
		const stepStart = Date.now()

		const child = spawn(
			PACKAGE_RUNNER.command,
			[...PACKAGE_RUNNER.args, step.script],
			{
				env: {
					...BUILD_ENV,
					...process.env
				},
				stdio: 'inherit',
				shell: process.platform === 'win32'
			}
		)

		child.on('exit', code => {
			const duration = Date.now() - stepStart
			const ok = code === 0
			results.push({ label: step.label, duration, ok })

			printStepEnd(step.label, ok, duration)

			if (ok) {
				resolve()
				return
			}

			reject(new Error(`${step.label} failed with exit code ${code}`))
		})
	})
}

async function main() {
	printBanner()

	try {
		for (const [index, step] of steps.entries()) {
			await runStep(step, index + 1, steps.length)
		}

		printSummary(true)
	} catch (error) {
		printSummary(false)
		console.error(
			`${COLORS.yellow}${String(error.message || error)}${COLORS.reset}`
		)
		process.exitCode = 1
	}
}

main()
