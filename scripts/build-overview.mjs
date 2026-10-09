import { spawn } from 'node:child_process'

const ESC = '\x1b['
const useColor = !process.env.NO_COLOR
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

if (!useColor) {
	for (const key of Object.keys(COLORS)) COLORS[key] = ''
}

const BOX_WIDTH = 58
const BAR_WIDTH = 22
const CHECK = '✓'
const CROSS = '✕'
const DOT = '·'
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const SPINNER_INTERVAL = 80
const CLEAR_LINE = `${ESC}2K\r`
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'gu')
const PACKAGE_RUNNER = { command: 'bun', args: ['run', '--silent'] }
const BUILD_ENV = {
	DATABASE_URL: 'postgresql://ci:ci@localhost:5432/ci',
	BETTER_AUTH_URL: 'http://localhost:3000',
	BETTER_AUTH_SECRET: 'ci-build-secret-ci-build-secret-ci-build-secret',
	BUILD_WITHOUT_DATABASE: process.env.DATABASE_URL ? undefined : 'true',
	FORCE_COLOR: useColor ? '1' : undefined
}
const isInteractive = Boolean(process.stdout.isTTY) && !process.env.CI

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

function paint(color, value) {
	return `${color}${value}${COLORS.reset}`
}

function gutter() {
	return `${paint(COLORS.frame, '│')}  `
}

function runCommand(step) {
	return `${PACKAGE_RUNNER.command} run ${step.script}`
}

function boxTop() {
	return paint(COLORS.frame, `╭${rule(BOX_WIDTH)}╮`)
}

function boxDivider() {
	return paint(COLORS.frame, `├${rule(BOX_WIDTH)}┤`)
}

function boxBottom() {
	return paint(COLORS.frame, `╰${rule(BOX_WIDTH)}╯`)
}

function boxLine(content = '') {
	const padding = ' '.repeat(Math.max(0, BOX_WIDTH - visibleLength(content)))
	const edge = paint(COLORS.frame, '│')
	return `${edge}${content}${padding}${edge}`
}

function boxCentered(content) {
	const pad = Math.max(0, BOX_WIDTH - visibleLength(content))
	const left = ' '.repeat(Math.floor(pad / 2))
	return boxLine(left + content)
}

function boxSpread(left, right) {
	const gap = BOX_WIDTH - visibleLength(left) - visibleLength(right) - 2
	return boxLine(`${left}${' '.repeat(Math.max(1, gap))}${right}  `)
}

function printBanner() {
	const flow = steps.map(step => step.label.toLowerCase()).join(` ${DOT} `)
	const title = `${paint(`${COLORS.bold}${COLORS.text}`, 'remcostoeten.nl')}  ${paint(COLORS.muted, 'release build')}`

	console.log('')
	console.log(boxTop())
	console.log(boxLine())
	console.log(boxCentered(title))
	console.log(boxCentered(paint(COLORS.accent, flow)))
	console.log(boxLine())
	console.log(boxBottom())
	console.log('')
}

function printStepStart(index, total, step) {
	const counter = paint(COLORS.accent, `${index}/${total}`)
	const label = paint(`${COLORS.bold}${COLORS.text}`, step.label)
	const command = paint(COLORS.muted, runCommand(step))
	const header = ` ${counter} ${label}  ${command} `
	const tail = rule(BOX_WIDTH - visibleLength(header))

	console.log(
		`${paint(COLORS.frame, '╭─')}${header}${paint(COLORS.frame, tail)}`
	)
}

function printStepEnd(label, ok, duration) {
	const color = ok ? COLORS.green : COLORS.red
	const icon = ok ? CHECK : CROSS
	const status = ok ? 'passed' : 'failed'
	const timing = paint(COLORS.muted, `${DOT} ${formatDuration(duration)}`)

	console.log(
		`${paint(COLORS.frame, '╰─')} ${paint(color, `${icon} ${label} ${status}`)} ${timing}`
	)
	console.log('')
}

function durationBar(duration, maxDuration) {
	const filled = Math.max(1, Math.round((duration / maxDuration) * BAR_WIDTH))
	return `${paint(COLORS.accent, rule(filled, '▮'))}${paint(COLORS.frame, rule(BAR_WIDTH - filled, '▯'))}`
}

function summaryRow(step, result, maxDuration, labelWidth) {
	const label = step.label.padEnd(labelWidth)

	if (!result) {
		const left = `  ${paint(COLORS.muted, DOT)} ${paint(COLORS.muted, label)}  ${paint(COLORS.dim, 'skipped')}`
		return boxLine(left)
	}

	const color = result.ok ? COLORS.green : COLORS.red
	const icon = result.ok ? CHECK : CROSS
	const bar = durationBar(result.duration, maxDuration)
	const left = `  ${paint(color, icon)} ${paint(COLORS.text, label)}  ${bar}`
	const right = paint(COLORS.muted, formatDuration(result.duration))

	return boxSpread(left, right)
}

function printSummary(success) {
	const totalDuration = Date.now() - startedAt
	const color = success ? COLORS.green : COLORS.red
	const icon = success ? CHECK : CROSS
	const title = success ? 'Build complete' : 'Build failed'
	const maxDuration = Math.max(...results.map(result => result.duration), 1)
	const labelWidth = Math.max(...steps.map(step => step.label.length))

	console.log(boxTop())
	console.log(
		boxCentered(paint(`${color}${COLORS.bold}`, `${icon} ${title}`))
	)
	console.log(boxDivider())

	for (const step of steps) {
		const result = results.find(entry => entry.label === step.label)
		console.log(summaryRow(step, result, maxDuration, labelWidth))
	}

	console.log(boxDivider())

	const totalLabel = paint(COLORS.muted, success ? 'Total' : 'Failed after')
	const totalTime = paint(
		`${COLORS.bold}${COLORS.text}`,
		formatDuration(totalDuration)
	)

	console.log(boxSpread(`  ${totalLabel}`, totalTime))
	console.log(boxBottom())
	console.log('')
}

function printFailure(failure) {
	console.error(`  ${paint(COLORS.red, `${CROSS} ${failure.message}`)}`)

	if (failure.step) {
		console.error(
			`    ${paint(COLORS.muted, 'rerun:')} ${paint(COLORS.text, runCommand(failure.step))}`
		)
	}

	console.error('')
}

function createPulse(stepStart) {
	if (!isInteractive) return { clear() {}, stop() {} }

	let frame = 0
	let visible = false

	function clear() {
		if (!visible) return
		process.stdout.write(CLEAR_LINE)
		visible = false
	}

	function draw() {
		clear()
		const glyph = SPINNER_FRAMES[frame % SPINNER_FRAMES.length]
		const elapsed = formatDuration(Date.now() - stepStart)
		frame += 1
		process.stdout.write(
			`${gutter()}${paint(COLORS.accent, glyph)} ${paint(COLORS.muted, elapsed)}`
		)
		visible = true
	}

	const timer = setInterval(draw, SPINNER_INTERVAL)

	function stop() {
		clearInterval(timer)
		clear()
	}

	return { clear, stop }
}

function createGutterWriter(stream, pulse) {
	let buffered = ''
	let lastWasBlank = true

	function writeLine(rawLine) {
		const blank = stripAnsi(rawLine).trim() === ''

		if (blank && lastWasBlank) return
		lastWasBlank = blank
		pulse.clear()
		stream.write(`${gutter()}${rawLine}\n`)
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

function stepFailure(step, message) {
	const failure = new Error(`${step.label} ${message}`)
	failure.step = step
	return failure
}

function runStep(step, index, total) {
	return new Promise((resolve, reject) => {
		printStepStart(index, total, step)
		const stepStart = Date.now()
		const pulse = createPulse(stepStart)

		const child = spawn(
			PACKAGE_RUNNER.command,
			[...PACKAGE_RUNNER.args, step.script],
			{
				env: {
					...BUILD_ENV,
					...process.env,
					NO_COLOR: useColor ? undefined : '1'
				},
				stdio: ['inherit', 'pipe', 'pipe'],
				shell: process.platform === 'win32'
			}
		)

		const stdoutGutter = createGutterWriter(process.stdout, pulse)
		const stderrGutter = createGutterWriter(process.stderr, pulse)

		child.stdout.on('data', chunk => stdoutGutter.push(chunk))
		child.stderr.on('data', chunk => stderrGutter.push(chunk))

		let settled = false

		function finishStep(ok, failure) {
			if (settled) return
			settled = true
			pulse.stop()
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
				stepFailure(step, `failed to start: ${error.message}`)
			)
		})

		child.on('close', code => {
			finishStep(
				code === 0,
				stepFailure(step, `failed with exit code ${code}`)
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
		printFailure(error)
		process.exitCode = 1
	}
}

main()
