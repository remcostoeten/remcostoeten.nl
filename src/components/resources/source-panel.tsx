'use client'

import { useEffect, useState } from 'react'
import { Code, FileText, Sparkles } from 'lucide-react'
import { AnimatedCheckIcon } from '@/components/animated-icons/icons/check'
import { AnimatedCopyIcon } from '@/components/animated-icons/icons/copy'
import { HighlightedLine } from '@/components/packages/package-code'
import { focusable, iconButton, sectionClass } from './class-names'
import type { InstallMode, ResourceConfig } from './types'

type SourcePanelProps = {
	config: ResourceConfig
	importsFor: (mode: InstallMode) => string
	usage: string
	defaultUsage: string
	notify: (message: string) => void
}

type DiffLine = { kind: 'same' | 'added' | 'removed'; text: string }

type RegistryFile = { name: string; content: string }

type RegistryItem = {
	name: string
	files: { path: string; content: string }[]
	registryDependencies?: string[]
}

const registryBase = 'https://www.remcostoeten.nl/r'
const usageTab = 'usage.tsx'

const segment = `h-7 rounded-[5px] border-0 bg-transparent px-3 font-mono text-[10px] text-muted-foreground hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--color-border)] ${focusable}`
const fileTab = `inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-2.5 font-mono text-[11px] text-muted-foreground hover:text-foreground aria-pressed:bg-foreground/7 aria-pressed:text-foreground [&_svg]:size-3 ${focusable}`
const toolbarButton = `inline-flex h-7 items-center gap-1.5 rounded-md border-0 bg-transparent px-2 font-mono text-[10px] text-muted-foreground hover:text-foreground [&_svg]:size-3.25 ${focusable}`
const note = 'm-0 text-xs leading-[1.7] text-muted-foreground'

async function registryFiles(name: string): Promise<RegistryFile[]> {
	const response = await fetch(`/r/${name}.json`)
	const item: RegistryItem = await response.json()
	const prefix = `registry/${item.name}/`
	const own = item.files.map(entry => ({
		name: entry.path.slice(prefix.length),
		content: entry.content
	}))
	const dependencies = await Promise.all(
		(item.registryDependencies ?? []).map(url =>
			registryFiles(url.slice(url.lastIndexOf('/') + 1, -'.json'.length))
		)
	)
	return [...own, ...dependencies.flat()]
}

function aiPrompt(config: ResourceConfig, importBlock: string, usage: string) {
	return [
		`Add the ${config.itemNoun} component from the remcostoeten.nl registry to this project.`,
		'',
		`Install it with: npx shadcn@latest add ${registryBase}/${config.registryItem}.json`,
		`The files are placed in ${config.installDir}.`,
		'',
		'Use it like this:',
		'',
		'```tsx',
		importBlock,
		'',
		usage,
		'```'
	].join('\n')
}

function diffLines(before: string, after: string): DiffLine[] {
	const a = before.split('\n')
	const b = after.split('\n')
	const table = Array.from({ length: a.length + 1 }, () =>
		new Array<number>(b.length + 1).fill(0)
	)
	for (let i = a.length - 1; i >= 0; i--)
		for (let j = b.length - 1; j >= 0; j--)
			table[i][j] =
				a[i] === b[j]
					? table[i + 1][j + 1] + 1
					: Math.max(table[i + 1][j], table[i][j + 1])

	const lines: DiffLine[] = []
	let i = 0
	let j = 0
	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) {
			lines.push({ kind: 'same', text: b[j] })
			i++
			j++
		} else if (table[i + 1][j] >= table[i][j + 1]) {
			lines.push({ kind: 'removed', text: a[i++] })
		} else {
			lines.push({ kind: 'added', text: b[j++] })
		}
	}
	while (i < a.length) lines.push({ kind: 'removed', text: a[i++] })
	while (j < b.length) lines.push({ kind: 'added', text: b[j++] })
	return lines
}

export function SourcePanel({
	config,
	importsFor,
	usage,
	defaultUsage,
	notify
}: SourcePanelProps) {
	const [tab, setTab] = useState(usageTab)
	const [mode, setMode] = useState<InstallMode>('registry')
	const [showChanges, setShowChanges] = useState(true)
	const [copied, setCopied] = useState<{
		target: string
		value: string
	} | null>(null)
	const [files, setFiles] = useState<RegistryFile[] | null>(null)
	const installCommand = `npx shadcn@latest add ${registryBase}/${config.registryItem}.json`
	const importBlock = importsFor(mode)
	const usageSource = `${importBlock}\n\n${usage}`
	const file = files?.find(item => item.name === tab)
	const code = tab === usageTab ? usageSource : (file?.content ?? '')
	const changed = usage !== defaultUsage
	const lines: DiffLine[] =
		tab === usageTab && changed && showChanges
			? diffLines(`${importBlock}\n\n${defaultUsage}`, usageSource)
			: code.split('\n').map(text => ({ kind: 'same', text }))
	const isCopied = copied?.target === tab && copied.value === code

	useEffect(() => {
		if (tab === usageTab || files) return
		let active = true
		registryFiles(config.registryItem)
			.then(result => {
				if (active) setFiles(result)
			})
			.catch(() => notify('Could not load the component source.'))
		return () => {
			active = false
		}
	}, [tab, files, notify, config.registryItem])

	async function copy(value: string, target: string) {
		try {
			await navigator.clipboard.writeText(value)
			setCopied({ target, value })
			notify('Copied to clipboard.')
		} catch {
			notify(
				'Clipboard access failed. Select the code below to copy it manually.'
			)
		}
	}

	return (
		<section className={sectionClass} id="implementation">
			<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="m-0 text-[15px] font-semibold tracking-[-0.02em]">
						Get the code
					</h2>
					<p className={`mt-1.5 ${note}`}>
						{mode === 'copy' ? (
							<>
								{config.files.length} files. Add them to your
								project.
							</>
						) : (
							<>
								Add the files to your app with the shadcn CLI.
								They land in{' '}
								<code className="font-mono">
									{config.installDir}
								</code>
								.
							</>
						)}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						className={`${toolbarButton} border border-border bg-background px-2.5 text-foreground`}
						onClick={() =>
							copy(
								aiPrompt(config, importsFor('registry'), usage),
								'ai'
							)
						}
					>
						{copied?.target === 'ai' ? (
							<AnimatedCheckIcon
								strokeWidth={1.5}
								aria-hidden="true"
							/>
						) : (
							<Sparkles strokeWidth={1.5} aria-hidden="true" />
						)}
						{copied?.target === 'ai' ? 'Copied' : 'Copy for AI'}
					</button>
					<div
						className="flex gap-0.5 rounded-[7px] bg-foreground/5 p-0.5"
						aria-label="Installation method"
					>
						<button
							type="button"
							className={segment}
							aria-pressed={mode === 'copy'}
							onClick={() => setMode('copy')}
						>
							Copy source
						</button>
						<button
							type="button"
							className={segment}
							aria-pressed={mode === 'registry'}
							onClick={() => setMode('registry')}
						>
							Registry
						</button>
					</div>
				</div>
			</div>
			{mode === 'registry' && (
				<div className="mb-4 flex items-center gap-3 rounded-[10px] border border-border bg-(--color-surface) py-1.5 pr-1.5 pl-4">
					<span
						className="select-none font-mono text-[11px] text-accent"
						aria-hidden="true"
					>
						$
					</span>
					<code className="min-w-0 flex-1 font-mono text-[11px] [overflow-wrap:anywhere]">
						{installCommand}
					</code>
					<button
						type="button"
						className={iconButton}
						aria-label="Copy installation command"
						onClick={() => copy(installCommand, 'install')}
					>
						{copied?.target === 'install' ? (
							<AnimatedCheckIcon
								strokeWidth={1.5}
								aria-hidden="true"
							/>
						) : (
							<AnimatedCopyIcon
								strokeWidth={1.5}
								aria-hidden="true"
							/>
						)}
					</button>
				</div>
			)}
			<div className="overflow-hidden rounded-[10px] border border-border bg-(--color-surface) shadow-[0_30px_60px_-40px_rgb(0_0_0/0.45)]">
				<div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-0 border-b border-border px-2 py-1.5">
					<div
						className="flex min-w-0 gap-0.5 overflow-x-auto"
						aria-label="Code examples"
					>
						{[usageTab, ...config.files].map(name => (
							<button
								key={name}
								type="button"
								className={fileTab}
								aria-pressed={tab === name}
								onClick={() => setTab(name)}
							>
								{name === usageTab ? (
									<Code
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								) : (
									<FileText
										strokeWidth={1.5}
										aria-hidden="true"
									/>
								)}
								{name}
							</button>
						))}
					</div>
					<div className="ml-auto flex items-center gap-1">
						{tab === usageTab && changed && (
							<button
								type="button"
								className={`${toolbarButton} aria-pressed:text-foreground`}
								aria-pressed={showChanges}
								onClick={() => setShowChanges(!showChanges)}
							>
								<span
									className={`size-1.5 rounded-full ${showChanges ? 'bg-accent' : 'bg-muted-foreground'}`}
								/>
								Changes
							</button>
						)}
						<button
							type="button"
							className={`${toolbarButton} border border-border bg-background px-2.5 text-foreground`}
							onClick={() => copy(code, tab)}
							disabled={!code}
						>
							{isCopied ? (
								<AnimatedCheckIcon
									strokeWidth={1.5}
									aria-hidden="true"
								/>
							) : (
								<AnimatedCopyIcon
									strokeWidth={1.5}
									aria-hidden="true"
								/>
							)}
							{isCopied ? 'Copied' : 'Copy'}
						</button>
					</div>
				</div>
				<pre className="m-0 max-h-[520px] overflow-auto bg-(--color-surface) py-4 font-mono text-xs leading-[22px] text-foreground max-[620px]:text-[11px]">
					<code className="block w-max min-w-full">
						{code === '' ? (
							<span className="block px-4 text-muted-foreground">
								Loading source…
							</span>
						) : (
							lines.map((line, index) => (
								<span
									key={`${index}-${line.kind}`}
									className={`block border-l-2 pr-6 pl-3 whitespace-pre ${
										line.kind === 'added'
											? 'border-emerald-500 bg-emerald-500/10'
											: line.kind === 'removed'
												? 'border-red-500 bg-red-500/10 opacity-70'
												: 'border-transparent'
									}`}
								>
									<span className="mr-5 inline-block w-6 select-none text-right text-muted-foreground/60">
										{line.kind === 'removed'
											? '-'
											: line.kind === 'added'
												? '+'
												: index + 1}
									</span>
									<HighlightedLine line={line.text} />
								</span>
							))
						)}
					</code>
				</pre>
			</div>
		</section>
	)
}
