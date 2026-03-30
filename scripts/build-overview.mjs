import { spawn } from 'node:child_process'

const COLORS = {
	reset: '\x1b[0m',
	dim: '\x1b[2m',
	cyan: '\x1b[36m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	bold: '\x1b[1m'
}

const steps = [
	{ label: 'Lint', command: 'npm', args: ['run', 'lint'] },
	{ label: 'Typecheck', command: 'npm', args: ['run', 'typecheck'] },
	{ label: 'Tests', command: 'npm', args: ['run', 'test'] },
	{ label: 'Build', command: 'npm', args: ['run', 'build:next'] }
]

const results = []
const startedAt = Date.now()

function formatDuration(ms) {
	if (ms < 1000) return `${ms}ms`
	return `${(ms / 1000).toFixed(1)}s`
}

function rule(char = '=') {
	return char.repeat(72)
}

function printBanner() {
	console.log(`${COLORS.cyan}${rule()}${COLORS.reset}`)
	console.log(
		`${COLORS.bold}${COLORS.cyan} Release Build Overview ${COLORS.reset}${COLORS.dim}lint -> typecheck -> test -> build${COLORS.reset}`
	)
	console.log(`${COLORS.cyan}${rule()}${COLORS.reset}\n`)
}

function printStepHeader(index, total, label) {
	console.log(
		`${COLORS.bold}${COLORS.cyan}[${index}/${total}]${COLORS.reset} ${COLORS.bold}${label}${COLORS.reset}`
	)
	console.log(`${COLORS.dim}${rule('-')}${COLORS.reset}`)
}

function printSummary(success) {
	console.log(`\n${COLORS.cyan}${rule()}${COLORS.reset}`)
	console.log(
		`${COLORS.bold}${success ? COLORS.green : COLORS.red}${success ? ' Summary' : ' Failed Summary'}${COLORS.reset}`
	)

	for (const result of results) {
		const color = result.ok ? COLORS.green : COLORS.red
		const state = result.ok ? 'PASS' : 'FAIL'
		console.log(
			`${color}${state.padEnd(4)}${COLORS.reset} ${result.label.padEnd(10)} ${COLORS.dim}${formatDuration(result.duration)}${COLORS.reset}`
		)
	}

	console.log(
		`${COLORS.bold}${success ? COLORS.green : COLORS.red}${success ? '\n Build pipeline complete' : '\n Build pipeline failed'}${COLORS.reset} ${COLORS.dim}in ${formatDuration(Date.now() - startedAt)}${COLORS.reset}`
	)
	console.log(`${COLORS.cyan}${rule()}${COLORS.reset}`)
}

function runStep(step, index, total) {
	return new Promise((resolve, reject) => {
		printStepHeader(index, total, step.label)
		const stepStart = Date.now()
		const child = spawn(step.command, step.args, {
			stdio: 'inherit',
			shell: process.platform === 'win32'
		})

		child.on('exit', code => {
			const duration = Date.now() - stepStart
			const ok = code === 0
			results.push({ label: step.label, duration, ok })

			if (ok) {
				console.log(
					`${COLORS.green}OK${COLORS.reset} ${step.label} ${COLORS.dim}(${formatDuration(duration)})${COLORS.reset}\n`
				)
				resolve()
				return
			}

			console.error(
				`${COLORS.red}FAILED${COLORS.reset} ${step.label} ${COLORS.dim}(${formatDuration(duration)})${COLORS.reset}\n`
			)
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
		console.error(`\n${COLORS.yellow}${String(error.message || error)}${COLORS.reset}`)
		process.exitCode = 1
	}
}

main()
