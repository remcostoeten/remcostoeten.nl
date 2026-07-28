import { cn } from '@/shared/lib/cn'

const tokenPattern =
	/(\/\/.*$|'.*?'|".*?"|`.*?`|\b(?:import|from|export|function|return|const|let|if|else|await|async|new|true|false)\b|\b\d+\b|<\/?[A-Z][A-Za-z0-9.]*(?:\s[^>]*)?\/?>)/gm

function tokenClass(token: string) {
	if (token.startsWith('//')) return 'text-[hsl(var(--sh-comment))] italic'
	if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`'))
		return 'text-[hsl(var(--sh-string))]'
	if (token.startsWith('<')) return 'text-[hsl(var(--sh-tag))]'
	if (/^\d+$/.test(token) || token === 'true' || token === 'false')
		return 'text-[hsl(var(--sh-number))]'
	return 'text-[hsl(var(--sh-keyword))]'
}

function HighlightedLine({ line }: { line: string }) {
	const nodes: React.ReactNode[] = []
	let cursor = 0

	for (const match of line.matchAll(tokenPattern)) {
		const index = match.index ?? 0
		if (index > cursor) nodes.push(line.slice(cursor, index))
		nodes.push(
			<span key={`${index}-${match[0]}`} className={tokenClass(match[0])}>
				{match[0]}
			</span>
		)
		cursor = index + match[0].length
	}

	if (cursor < line.length) nodes.push(line.slice(cursor))
	return <>{nodes}</>
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
			<pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-[hsl(var(--sh-text))]">
				<code>
					{code.split('\n').map((line, index) => (
						<span
							key={`${line}-${index}`}
							className="block min-w-max"
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
