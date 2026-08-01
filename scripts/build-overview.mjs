import { spawn } from 'node:child_process'

const ESC = '\x1b['
const COLORS = {
	reset: `${ESC}0m`,
	bold: `${ESC}1m`,
	dim: `${ESC}2m`,
	frame: `${ESC}38;5;60m`,
	accent: `${ESC}38;5;110m`,
	text: `${ESC}38;5;252m`,
	muted: `${ESC}38;5;243m`,
	green: `${ESC}38;5;114m`,
	red: `${ESC}38;5;174m`,
	yellow: `${ESC}38;5;179m`
}

const BOX_WIDTH = 58
const BAR_WIDTH = 22
const CHECK = '✓'
const CROSS = '✕'
const DOT = '·'
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'gu')
const PACKAGE_RUNNER = { command: 'npm', args: ['run', '--silent'] }
const BUILD_ENV = {
	DATABASE_URL: 'postgresql://ci:ci@localhost:5432/ci',
	BETTER_AUTH_URL: 'http://localhost:3000',
	BETTER_AUTH_SECRET: 'ci-build-secret-ci-build-secret-ci-build-secret',
	FORCE_COLOR: '1'
}

const steps = [
	{ label: 'Lint', script: 'lint' },
	{ label: 'Typecheck', script: 'typecheck' },
	{ label: 'Tests', script: 'test' },
	{ label: 'Build', script: 'build:next' }
]

const results = []
const startedAt = Date.now()

function formatDuration(ms) {
	if (ms < 1000) return `${ms}ms`
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
	const minutes = Math.floor(ms / 60_000)
	const seconds = Math.round((ms % 60_000) / 1000)
	return `${minutes}m ${seconds}s`
}

function stripAnsi(value) {
	return value.replace(ANSI_PATTERN, '')
}

function visibleLength(value) {
	return stripAnsi(value).length
}

function rule(len, char = '─') {
	return char.repeat(Math.max(0, len))
}

function boxTop() {
	return `${COLORS.frame}╭${rule(BOX_WIDTH)}╮${COLORS.reset}`
}

function boxDivider() {
	return `${COLORS.frame}├${rule(BOX_WIDTH)}┤${COLORS.reset}`
}

function boxBottom() {
	return `${COLORS.frame}╰${rule(BOX_WIDTH)}╯${COLORS.reset}`
}

function boxLine(content = '') {
	const padding = ' '.repeat(Math.max(0, BOX_WIDTH - visibleLength(content)))
	return `${COLORS.frame}│${COLORS.reset}${content}${padding}${COLORS.frame}│${COLORS.reset}`
}

function boxCentered(content) {
	const pad = Math.max(0, BOX_WIDTH - visibleLength(content))
	const left = ' '.repeat(Math.floor(pad / 2))
	return boxLine(left + content)
}

function printBanner() {
	const flow = steps
		.map(step => step.label.toLowerCase())
		.join(` ${DOT} `)

	console.log('')
	console.log(boxTop())
	console.log(boxLine())
	console.log(boxCentered(`${COLORS.bold}${COLORS.text}remcostoeten.nl${COLORS.reset} ${COLORS.muted}release build${COLORS.reset}`))
	console.log(boxCentered(`${COLORS.accent}${flow}${COLORS.reset}`))
	console.log(boxLine())
	console.log(boxBottom())
	console.log('')
}

function printStepStart(index, total, label) {
	const header = ` ${COLORS.accent}${index}/${total}${COLORS.reset} ${COLORS.bold}${COLORS.text}${label}${COLORS.reset} `
	const tail = rule(BOX_WIDTH - visibleLength(header) - 2)

	console.log(`${COLORS.frame}╭─${COLORS.reset}${header}${COLORS.frame}${tail}${COLORS.reset}`)
}

function printStepEnd(label, ok, duration) {
	const color = ok ? COLORS.green : COLORS.red
	const icon = ok ? CHECK : CROSS
	const status = ok ? 'passed' : 'failed'

	console.log(
		`${COLORS.frame}╰─${COLORS.reset} ${color}${icon} ${label} ${status}${COLORS.reset} ${COLORS.muted}${DOT} ${formatDuration(duration)}${COLORS.reset}`
	)
	console.log('')
}

function durationBar(duration, maxDuration) {
	const filled = Math.max(1, Math.round((duration / maxDuration) * BAR_WIDTH))
	return rule(filled, '▮') + COLORS.frame + rule(BAR_WIDTH - filled, '▯')
}

function printSummary(success) {
	const totalDuration = Date.now() - startedAt
	const color = success ? COLORS.green : COLORS.red
	const icon = success ? CHECK : CROSS
	const title = success ? 'Build complete' : 'Build failed'
	const maxDuration = Math.max(...results.map(result => result.duration), 1)
	const labelWidth = Math.max(...steps.map(step => step.label.length))

	console.log(boxTop())
	console.log(boxCentered(`${color}${COLORS.bold}${icon} ${title}${COLORS.reset}`))
	console.log(boxDivider())

	for (const result of results) {
		const resultColor = result.ok ? COLORS.green : COLORS.red
		const resultIcon = result.ok ? CHECK : CROSS
		const label = result.label.padEnd(labelWidth)
		const bar = durationBar(result.duration, maxDuration)
		const duration = formatDuration(result.duration)
		const left = `  ${resultColor}${resultIcon}${COLORS.reset} ${COLORS.text}${label}${COLORS.reset}  ${COLORS.accent}${bar}${COLORS.reset}`
		const gap = BOX_WIDTH - visibleLength(left) - duration.length - 2

		console.log(
			boxLine(
				`${left}${' '.repeat(Math.max(1, gap))}${COLORS.muted}${duration}${COLORS.reset}`
			)
		)
	}

	console.log(boxDivider())

	const totalLabel = success ? 'Total' : 'Failed after'
	const totalTime = formatDuration(totalDuration)
	const gap = BOX_WIDTH - totalLabel.length - totalTime.length - 4

	console.log(
		boxLine(
			`  ${COLORS.muted}${totalLabel}${COLORS.reset}${' '.repeat(Math.max(1, gap))}${COLORS.bold}${COLORS.text}${totalTime}${COLORS.reset}`
		)
	)
	console.log(boxBottom())
	console.log('')
}

function createGutterWriter(stream) {
	let buffered = ''
	let lastWasBlank = true

	function writeLine(rawLine) {
		const blank = stripAnsi(rawLine).trim() === ''

		if (blank && lastWasBlank) return
		lastWasBlank = blank
		stream.write(`${COLORS.frame}│${COLORS.reset}  ${rawLine}\n`)
	}

	function push(chunk) {
		buffered += chunk.toString()
		const lines = buffered.split('\n')
		buffered = lines.pop()

		for (const rawLine of lines) {
			writeLine(rawLine.replace(/\r$/u, ''))
		}
	}

	function flush() {
		if (stripAnsi(buffered).trim() !== '') writeLine(buffered)
		buffered = ''
	}

	return { push, flush }
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
				stdio: ['inherit', 'pipe', 'pipe'],
				shell: process.platform === 'win32'
			}
		)

		const stdoutGutter = createGutterWriter(process.stdout)
		const stderrGutter = createGutterWriter(process.stderr)

		child.stdout.on('data', chunk => stdoutGutter.push(chunk))
		child.stderr.on('data', chunk => stderrGutter.push(chunk))

		let settled = false

		function finishStep(ok, failure) {
			if (settled) return
			settled = true
			stdoutGutter.flush()
			stderrGutter.flush()
			const duration = Date.now() - stepStart
			results.push({ label: step.label, duration, ok })

			printStepEnd(step.label, ok, duration)

			if (ok) {
				resolve()
				return
			}

			reject(failure)
		}

		child.on('error', error => {
			finishStep(
				false,
				new Error(`${step.label} failed to start: ${error.message}`)
			)
		})

		child.on('close', code => {
			finishStep(
				code === 0,
				new Error(`${step.label} failed with exit code ${code}`)
			)
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
