'use client'

import { useId, useState } from 'react'
import { ChevronDown, LayoutGrid, Layers, Search } from 'lucide-react'
import { caps, focusable, ruleTop } from './class-names'
import type { DemoEntry } from './entries'

type SidebarProps = {
	entries: readonly DemoEntry[]
	selectedId: string
	onSelect: (id: string) => void
}

type NavigationProps = SidebarProps & { layout: 'desktop' | 'mobile' }

const count = 'font-mono text-[9px] tabular-nums text-muted-foreground'
const link = `flex min-h-9 w-full gap-2.5 rounded-[5px] px-2.5 text-left text-xs no-underline [&>svg]:size-3.5 [&>svg]:shrink-0 ${focusable}`
const record = 'absolute h-4 rounded-[3px] border border-border bg-background'
const idle = 'text-muted-foreground hover:bg-foreground/4 hover:text-foreground'

function RegistryNavigation({
	entries,
	selectedId,
	onSelect,
	layout
}: NavigationProps) {
	const [query, setQuery] = useState('')
	const searchId = useId()
	const matches = entries.filter(entry =>
		`${entry.name} ${entry.summary}`
			.toLowerCase()
			.includes(query.trim().toLowerCase())
	)
	const mobile = layout === 'mobile'

	return (
		<>
			<div
				className={`relative flex items-center ${mobile ? 'mb-3' : 'mb-6'}`}
			>
				<Search
					className="pointer-events-none absolute left-[11px] size-[13px] text-muted-foreground"
					strokeWidth={1.5}
					aria-hidden="true"
				/>
				<label className="sr-only" htmlFor={searchId}>
					Find an empty state
				</label>
				<input
					id={searchId}
					className="h-[34px] w-full min-w-0 rounded-[5px] border-0 bg-foreground/4 py-[9px] pr-[9px] pl-8 font-mono text-[10px] text-foreground transition-colors placeholder:text-muted-foreground focus:bg-foreground/7 focus-visible:outline-none"
					type="search"
					placeholder="Find an empty state…"
					value={query}
					onChange={event => setQuery(event.target.value)}
				/>
			</div>
			<nav aria-label="Empty state registry">
				<div className="mb-3 flex items-center justify-between px-2.5">
					<span className={`text-[9px] ${caps}`}>Empty states</span>
					<span className={count}>
						{entries.length.toString().padStart(2, '0')}
					</span>
				</div>
				<div>
					{matches.map(entry => (
						<a
							key={entry.id}
							href={`?component=${entry.id}#component`}
							className={`${link} items-start py-3 not-first:mt-0.5 [&>svg]:mt-0.5 ${
								entry.id === selectedId
									? 'bg-foreground/6 text-foreground hover:bg-foreground/8'
									: idle
							}`}
							aria-current={
								entry.id === selectedId ? 'page' : undefined
							}
							onClick={event => {
								event.preventDefault()
								onSelect(entry.id)
							}}
						>
							<Layers strokeWidth={1.5} aria-hidden="true" />
							<span>
								{entry.name}
								<small className="mt-[5px] block text-[10px] text-muted-foreground">
									{entry.summary}
								</small>
							</span>
							{entry.id === selectedId && (
								<span className="mt-1.5 ml-auto size-1 shrink-0 rounded-full bg-foreground" />
							)}
						</a>
					))}
					{matches.length === 0 && (
						<div className="px-2.5 py-2">
							<p className="m-0 mb-2.5 text-[11px] leading-[1.6] text-muted-foreground">
								No matching empty states.
							</p>
							<button
								type="button"
								className={`-ml-[7px] rounded-[4px] border-0 bg-transparent px-[7px] py-[5px] font-mono text-[10px] text-foreground hover:bg-foreground/4 ${focusable}`}
								onClick={() => setQuery('')}
							>
								Clear search
							</button>
						</div>
					)}
				</div>
			</nav>
		</>
	)
}

export function Sidebar(props: SidebarProps) {
	return (
		<aside
			className="sticky top-0 flex max-h-svh flex-col overflow-y-auto border-0 border-r border-border/60 px-2 pt-4 pb-5 md:px-3 max-[900px]:static max-[900px]:max-h-none max-[900px]:overflow-visible max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:p-0"
			aria-label="Browse the registry"
		>
			<div className="max-[900px]:hidden">
				<RegistryNavigation {...props} layout="desktop" />
			</div>
			<details className="group/mobile hidden max-[900px]:block">
				<summary
					className={`flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 font-mono text-[10px] text-muted-foreground md:px-5 [&::-webkit-details-marker]:hidden [&>svg]:size-[13px] ${focusable}`}
				>
					<LayoutGrid strokeWidth={1.5} aria-hidden="true" />
					<span>Browse the registry</span>
					<span className={`ml-auto ${count}`}>
						{props.entries.length.toString().padStart(2, '0')}
					</span>
					<ChevronDown
						className="group-open/mobile:rotate-180"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
				</summary>
				<div className={`px-4 pt-3 pb-5 md:px-5 ${ruleTop}`}>
					<RegistryNavigation {...props} layout="mobile" />
				</div>
			</details>
			<div className="mx-2.5 mt-auto mb-0 pt-10 max-[900px]:hidden">
				<div className="relative h-[30px] w-[42px]" aria-hidden="true">
					<span className={`inset-x-1.5 top-0 ${record}`} />
					<span className={`inset-x-[3px] top-1.5 ${record}`} />
					<span className={`inset-x-0 top-3 ${record}`} />
				</div>
				<p className="mt-[17px] mb-[23px] text-[11px] leading-[1.8] text-muted-foreground">
					A place to start,
					<br />
					before there&apos;s anything.
				</p>
				<div className={`flex justify-between pt-[15px] ${ruleTop}`}>
					<span className={`text-[8px] ${caps}`}>TSX + Tailwind</span>
					<span className={`text-[8px] ${caps}`}>v0.1.0</span>
				</div>
			</div>
		</aside>
	)
}
