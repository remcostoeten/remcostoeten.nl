import { cn } from '@/shared/lib/cn'

const tokenPattern =
	/(\/\/.*$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|((?<=<\/?)[A-Za-z][\w.]*)|(\b[a-zA-Z][\w-]*(?==[^=>]))|(\b(?:import|from|export|default|function|return|const|let|if|else|await|async|new|type|as)\b)|(\b(?:\d+(?:\.\d+)?|true|false|null|undefined)\b)|(\b[A-Za-z_]\w*(?=(?:<[^<>()]*>)?\())|(\b[A-Z]\w*\b)/gm

const tokenKinds = [
	'comment',
	'string',
	'tag',
	'attribute',
	'keyword',
	'number',
	'call',
	'type'
] as const

const tokenClasses: Record<(typeof tokenKinds)[number], string> = {
	comment: 'text-[hsl(var(--sh-comment))] italic',
	string: 'text-[hsl(var(--sh-string))]',
	tag: 'text-[hsl(var(--sh-tag))]',
	attribute: 'text-[hsl(var(--sh-function))]',
	keyword: 'text-[hsl(var(--sh-keyword))]',
	number: 'text-[hsl(var(--sh-number))]',
	call: 'text-[hsl(var(--sh-function))]',
	type: 'text-[hsl(var(--sh-tag))]'
}

function tokenClass(match: RegExpMatchArray) {
	const kind =
		tokenKinds[match.slice(1).findIndex(group => group !== undefined)]
	return kind ? tokenClasses[kind] : undefined
}

export function HighlightedLine({ line }: { line: string }) {
	const nodes: React.ReactNode[] = []
	let cursor = 0

	for (const match of line.matchAll(tokenPattern)) {
		const index = match.index ?? 0
		if (index > cursor) nodes.push(line.slice(cursor, index))
		nodes.push(
			<span key={`${index}-${match[0]}`} className={tokenClass(match)}>
				{match[0]}
			</span>
		)
		cursor = index + match[0].length
	}

	if (cursor < line.length) nodes.push(line.slice(cursor))
	return <>{nodes}</>
}

function commandTokenClass(token: string, index: number) {
	if (index === 0) return 'text-[hsl(var(--sh-keyword))]'
	if (/^https?:\/\//.test(token)) return 'text-[hsl(var(--sh-string))]'
	if (token.startsWith('-')) return 'text-[hsl(var(--sh-number))]'
	if (index === 1) return 'text-[hsl(var(--sh-function))]'
	return undefined
}

export function HighlightedCommand({ command }: { command: string }) {
	return (
		<>
			{command.split(' ').map((token, index) => (
				<span
					key={`${index}-${token}`}
					className={commandTokenClass(token, index)}
				>
					{index > 0 && ' '}
					{token}
				</span>
			))}
		</>
	)
}

export function PackageCode({
	code,
	fileName,
	className
}: {
	code: string
	fileName: string
	className?: string
}) {
	return (
		<div
			className={cn(
				'overflow-hidden border border-[hsl(var(--sh-border))] bg-[hsl(var(--sh-background))]',
				className
			)}
		>
			<div className="flex items-center justify-between border-b border-[hsl(var(--sh-border))] px-4 py-2.5">
				<span className="font-mono text-[11px] text-muted-foreground">
					{fileName}
				</span>
				<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
					tsx
				</span>
			</div>
			<pre className="min-w-0 max-w-full overflow-x-hidden whitespace-pre-wrap break-words p-4 font-mono text-xs leading-6 text-[hsl(var(--sh-text))] [overflow-wrap:anywhere]">
				<code>
					{code.split('\n').map((line, index) => (
						<span
							key={`${line}-${index}`}
							className="block min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
						>
							<span className="mr-4 inline-block w-4 select-none text-right text-[hsl(var(--sh-comment))]">
								{index + 1}
							</span>
							<HighlightedLine line={line} />
						</span>
					))}
				</code>
			</pre>
		</div>
	)
}
