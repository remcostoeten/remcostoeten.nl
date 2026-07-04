'use client'

import { forwardRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TFindReplaceStore } from '../hooks/use-find-replace-store'
import { getLineAndColumn } from '../utils/search'
import { OptionToggle } from './option-toggle'

type Props = {
	store: TFindReplaceStore
	replaceInputRef: React.RefObject<HTMLInputElement | null>
}

export const FindControls = forwardRef<HTMLInputElement, Props>(
	function FindControls({ store, replaceInputRef }, findInputRef) {
		const {
			workspace,
			matches,
			matchesTruncated,
			searchError,
			currentMatchIndex,
			setSearch,
			setReplace,
			toggleOption,
			nextMatch,
			previousMatch,
			replaceCurrent,
			replaceFirst,
			replaceAll
		} = store

		const currentMatch = matches[currentMatchIndex]
		const position = currentMatch
			? getLineAndColumn(workspace.input, currentMatch.start)
			: null

		function runReplaceAll() {
			const result = replaceAll()
			if (!result.ok) {
				toast.error(result.error)
				return
			}
			toast.success(
				`Replaced ${result.count} occurrence${result.count === 1 ? '' : 's'}`
			)
		}

		function runReplaceFirst() {
			const result = replaceFirst()
			if (!result.ok) {
				toast.error(result.error)
				return
			}
			toast.success(
				result.count > 0
					? 'Replaced first occurrence'
					: 'Nothing to replace'
			)
		}

		function runReplaceCurrent() {
			const result = replaceCurrent()
			if (!result.ok) {
				toast.error(result.error)
				return
			}
			if (result.count > 0) toast.success('Replaced selected match')
		}

		return (
			<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<div className="relative grow">
						<label htmlFor="find-input" className="sr-only">
							Find
						</label>
						<Input
							id="find-input"
							ref={findInputRef}
							value={workspace.search}
							onChange={event => setSearch(event.target.value)}
							placeholder="Find… (Ctrl+F)"
							autoComplete="off"
							spellCheck={false}
							aria-invalid={searchError !== null}
							aria-describedby={
								searchError ? 'find-error' : 'find-status'
							}
							className="h-9 pr-24 font-mono text-sm !border-border/50"
						/>
						<span
							id="find-status"
							aria-live="polite"
							className="absolute right-2 top-1/2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
						>
							{workspace.search === ''
								? ''
								: matches.length === 0
									? 'No matches'
									: `${currentMatchIndex + 1} / ${matches.length}${matchesTruncated ? '+' : ''}`}
						</span>
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="sm"
							className="h-9 w-9 p-0 !border-border/50"
							aria-label="Previous match (Shift+F3)"
							title="Previous match (Shift+F3)"
							disabled={matches.length === 0}
							onClick={previousMatch}
						>
							<ChevronUp aria-hidden className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-9 w-9 p-0 !border-border/50"
							aria-label="Next match (F3)"
							title="Next match (F3)"
							disabled={matches.length === 0}
							onClick={nextMatch}
						>
							<ChevronDown aria-hidden className="size-4" />
						</Button>

						<div
							role="group"
							aria-label="Search options"
							className="ml-1 flex items-center gap-1"
						>
							<OptionToggle
								pressed={workspace.options.caseSensitive}
								label="Match case"
								hint="Match case"
								onToggle={() => toggleOption('caseSensitive')}
							>
								Aa
							</OptionToggle>
							<OptionToggle
								pressed={workspace.options.wholeWord}
								label="Match whole word"
								hint="Match whole word"
								onToggle={() => toggleOption('wholeWord')}
							>
								ab
							</OptionToggle>
							<OptionToggle
								pressed={workspace.options.regex}
								label="Use regular expression"
								hint="Use regular expression"
								onToggle={() => toggleOption('regex')}
							>
								.*
							</OptionToggle>
							<OptionToggle
								pressed={workspace.options.multiline}
								label="Multiline regex (^ and $ match line boundaries)"
								hint="Multiline regex (^ $ per line)"
								disabled={!workspace.options.regex}
								onToggle={() => toggleOption('multiline')}
							>
								¶
							</OptionToggle>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<div className="grow">
						<label htmlFor="replace-input" className="sr-only">
							Replace with
						</label>
						<Input
							id="replace-input"
							ref={replaceInputRef}
							value={workspace.replace}
							onChange={event => setReplace(event.target.value)}
							placeholder={
								workspace.options.regex
									? 'Replace with… ($1 for groups, Ctrl+H)'
									: 'Replace with… (Ctrl+H)'
							}
							autoComplete="off"
							spellCheck={false}
							className="h-9 font-mono text-sm !border-border/50"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-1">
						<div
							role="group"
							aria-label="Replace options"
							className="flex items-center gap-1"
						>
							<OptionToggle
								pressed={workspace.options.preserveCase}
								label="Preserve case of replaced text"
								hint="Preserve case (Foo → Bar, FOO → BAR)"
								onToggle={() => toggleOption('preserveCase')}
							>
								AB
							</OptionToggle>
							<OptionToggle
								pressed={workspace.options.trimWhitespace}
								label="Trim trailing whitespace in output"
								hint="Trim trailing whitespace in output"
								onToggle={() => toggleOption('trimWhitespace')}
							>
								⌫
							</OptionToggle>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="h-9 !border-border/50"
							disabled={matches.length === 0}
							onClick={runReplaceCurrent}
							title="Replace the highlighted match in the input"
						>
							Replace
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-9 !border-border/50"
							disabled={
								workspace.search === '' || searchError !== null
							}
							onClick={runReplaceFirst}
							title="Replace only the first occurrence"
						>
							First
						</Button>
						<Button
							variant="secondary"
							size="sm"
							className="h-9"
							disabled={
								workspace.search === '' || searchError !== null
							}
							onClick={runReplaceAll}
							title="Replace all occurrences (Ctrl+Shift+H)"
						>
							Replace all
						</Button>
					</div>
				</div>

				<div aria-live="polite" className="min-h-4 text-xs">
					{searchError !== null ? (
						<p
							id="find-error"
							role="alert"
							className="text-destructive"
						>
							Invalid pattern: {searchError}
						</p>
					) : position !== null ? (
						<p className="text-muted-foreground">
							Current match at line {position.line}, column{' '}
							{position.column}
						</p>
					) : null}
				</div>
			</div>
		)
	}
)
