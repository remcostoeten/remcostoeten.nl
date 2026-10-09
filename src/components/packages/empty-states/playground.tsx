'use client'

import { useId, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { EmptyState } from '@/components/empty-state/empty-state'
import {
	caps,
	ruleBottom,
	ruleTop,
	sectionClass,
	textButton
} from './class-names'
import type { DemoEntry, DemoValues } from './entries'
import { SourcePanel } from './source-panel'
import {
	actionLabel,
	buildUsage,
	entranceOptions,
	loopOptions,
	parseEntrance,
	parseLoop,
	parsePointer,
	pointerOptions
} from './usage'

type Field = {
	key:
		| 'title'
		| 'description'
		| 'primaryLabel'
		| 'secondaryLabel'
		| 'linkTopic'
	label: string
	multiline?: boolean
}

type Select = {
	key: 'variant' | 'animated' | 'pointer' | 'loop'
	label: string
	options: readonly string[]
}

type Toggle = {
	key: 'showActions' | 'showGuides' | 'showLink' | 'loop'
	label: string
}

type PlaygroundProps = {
	entry: DemoEntry
	notify: (message: string) => void
}

const colors = {
	background: 'var(--color-background)',
	foreground: 'var(--color-foreground)',
	muted: 'var(--color-muted-foreground)',
	border: 'var(--color-border)',
	surface: 'var(--color-background)'
}

const fieldLabel = 'font-mono text-[10px] text-muted-foreground'
const edited =
	'after:ml-1.5 after:inline-block after:size-1 after:rounded-full after:bg-accent after:align-middle'
const fieldInput =
	'm-0 w-full rounded-md border border-transparent bg-foreground/5 px-3 font-sans text-xs text-foreground outline-none transition-[background-color,border-color] duration-150 hover:bg-foreground/7 focus:border-foreground/25 focus:bg-background'
const segment =
	'relative flex h-7 cursor-pointer select-none items-center justify-center rounded-[5px] px-1.5 font-sans text-[11px] capitalize text-muted-foreground transition-[background-color,color,box-shadow] duration-150 hover:text-foreground has-checked:bg-background has-checked:text-foreground has-checked:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--color-border)] has-focus-visible:ring-2 has-focus-visible:ring-foreground/25'
const toggleInput =
	'relative m-0 h-4 w-[27px] shrink-0 cursor-pointer appearance-none rounded-[10px] border border-border bg-border transition-colors checked:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 after:absolute after:top-0.5 after:left-0.5 after:size-2.5 after:rounded-full after:bg-(--color-surface) after:transition-transform checked:after:translate-x-[11px]'

function fieldsFor(entry: DemoEntry): Field[] {
	const twoActions = entry.actions.length > 1
	return [
		{ key: 'title', label: 'Title' },
		{ key: 'description', label: 'Description', multiline: true },
		{
			key: 'primaryLabel',
			label: twoActions ? 'Primary action' : 'Action label'
		},
		...(twoActions
			? [{ key: 'secondaryLabel', label: 'Secondary action' } as const]
			: []),
		...(entry.link
			? [{ key: 'linkTopic', label: 'Docs topic' } as const]
			: [])
	]
}

function selectsFor(entry: DemoEntry): Select[] {
	return [
		...(entry.variants
			? [
					{
						key: 'variant',
						label: 'Illustration',
						options: entry.variants
					} as const
				]
			: []),
		{ key: 'animated', label: 'Entrance motion', options: entranceOptions },
		{ key: 'pointer', label: 'Pointer', options: pointerOptions },
		...(entry.loopKind === 'variant'
			? [
					{
						key: 'loop',
						label: 'Loop motion',
						options: loopOptions
					} as const
				]
			: [])
	]
}

function togglesFor(entry: DemoEntry): Toggle[] {
	return [
		{
			key: 'showActions',
			label: entry.actions.length > 1 ? 'Actions' : 'Action'
		},
		...(entry.guides
			? [{ key: 'showGuides', label: entry.guides.title } as const]
			: []),
		...(entry.link
			? [{ key: 'showLink', label: 'Docs link' } as const]
			: []),
		...(entry.loopKind === 'toggle'
			? [{ key: 'loop', label: 'Loop motion' } as const]
			: [])
	]
}

export function Playground({ entry, notify }: PlaygroundProps) {
	const [values, setValues] = useState(entry.defaults)
	const [replay, setReplay] = useState(0)
	const fieldId = useId()
	const fields = fieldsFor(entry)
	const selects = selectsFor(entry)
	const toggles = togglesFor(entry)
	const editedCount = new Set(
		[...fields, ...selects, ...toggles]
			.map(control => control.key)
			.filter(key => values[key] !== entry.defaults[key])
	).size
	const motionEnabled = values.animated !== 'off'

	function isEdited(key: keyof DemoValues) {
		return values[key] !== entry.defaults[key]
	}

	function update(key: keyof DemoValues, value: string | boolean) {
		setValues(current => ({ ...current, [key]: value }))
		if (key === 'animated') setReplay(count => count + 1)
	}

	function reset() {
		setValues(entry.defaults)
		setReplay(count => count + 1)
	}

	return (
		<>
			<section id="component" className={sectionClass}>
				<div className="grid grid-cols-[minmax(0,1fr)_260px] overflow-hidden rounded-[10px] border border-border max-[1100px]:grid-cols-[minmax(0,1fr)_220px] max-[620px]:grid-cols-1">
					<div className="flex min-w-0 flex-col">
						<div
							className={`flex h-12 items-center justify-between px-5 ${ruleBottom}`}
						>
							<span
								className={`flex items-center gap-[7px] text-[9px] ${caps}`}
							>
								<span className="relative flex size-[5px]">
									<span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
									<span className="size-[5px] rounded-full bg-accent" />
								</span>
								Live preview
							</span>
							<button
								type="button"
								className={textButton}
								onClick={() => setReplay(replay + 1)}
								disabled={!motionEnabled}
							>
								<RotateCcw
									strokeWidth={1.5}
									aria-hidden="true"
								/>{' '}
								Replay
							</button>
						</div>
						<div className="relative flex min-h-[486px] flex-1 items-center overflow-hidden bg-background max-[620px]:min-h-[430px]">
							<div
								className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[18px_18px] [mask-image:radial-gradient(ellipse_65%_70%_at_50%_45%,black,transparent)]"
								aria-hidden="true"
							/>
							<div
								className="relative flex w-full items-center"
								key={replay}
							>
								<Preview
									entry={entry}
									values={values}
									notify={notify}
								/>
							</div>
						</div>
					</div>
					<aside
						id="customize"
						className="scroll-mt-6 border-0 border-l border-border bg-(--color-surface) max-[620px]:border-t max-[620px]:border-l-0"
						aria-label="Customize the component"
					>
						<div
							className={`flex h-12 items-center justify-between px-[18px] ${ruleBottom}`}
						>
							<span
								className={`flex items-center gap-2 text-[9px] ${caps}`}
							>
								Props
								{editedCount > 0 && (
									<span className="rounded-full bg-accent/12 px-1.5 py-0.5 tabular-nums text-accent">
										{editedCount} edited
									</span>
								)}
							</span>
							<button
								type="button"
								className={textButton}
								onClick={reset}
								disabled={editedCount === 0}
							>
								<RotateCcw
									strokeWidth={1.5}
									aria-hidden="true"
								/>{' '}
								Reset
							</button>
						</div>
						<div className="grid gap-4 p-[18px]">
							{fields.map(field => (
								<label
									key={field.key}
									className={`flex flex-col gap-2 ${fieldLabel}`}
								>
									<span
										className={
											isEdited(field.key) ? edited : ''
										}
									>
										{field.label}
									</span>
									{field.multiline ? (
										<textarea
											className={`max-h-40 min-h-[76px] resize-none py-2 leading-normal field-sizing-content ${fieldInput}`}
											value={values[field.key]}
											onChange={event =>
												update(
													field.key,
													event.target.value
												)
											}
										/>
									) : (
										<input
											className={`h-9 ${fieldInput}`}
											value={values[field.key]}
											onChange={event =>
												update(
													field.key,
													event.target.value
												)
											}
										/>
									)}
								</label>
							))}
							{selects.map(select => (
								<fieldset
									key={select.key}
									className="m-0 min-w-0 border-0 p-0"
								>
									<legend
										className={`mb-2 p-0 ${fieldLabel} ${isEdited(select.key) ? edited : ''}`}
									>
										{select.label}
									</legend>
									<div className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-[7px] bg-foreground/5 p-0.5">
										{select.options.map(option => (
											<label
												key={option}
												className={segment}
											>
												<input
													className="sr-only"
													type="radio"
													name={`${fieldId}-${select.key}`}
													value={option}
													checked={
														values[select.key] ===
														option
													}
													onChange={() =>
														update(
															select.key,
															option
														)
													}
												/>
												{option}
											</label>
										))}
									</div>
								</fieldset>
							))}
						</div>
						<div className={`grid gap-[15px] p-[18px] ${ruleTop}`}>
							{toggles.map(toggle => (
								<label
									key={toggle.key}
									className="flex items-center justify-between text-[11px]"
								>
									<span
										className={
											isEdited(toggle.key) ? edited : ''
										}
									>
										{toggle.label}
									</span>
									<input
										className={toggleInput}
										type="checkbox"
										role="switch"
										checked={
											toggle.key === 'loop'
												? values.loop === 'on'
												: values[toggle.key]
										}
										onChange={event =>
											toggle.key === 'loop'
												? update(
														'loop',
														event.target.checked
															? 'on'
															: 'off'
													)
												: update(
														toggle.key,
														event.target.checked
													)
										}
									/>
								</label>
							))}
						</div>
					</aside>
				</div>
			</section>
			<SourcePanel
				imports={entry.imports}
				usage={buildUsage(entry, values)}
				defaultUsage={buildUsage(entry, entry.defaults)}
				notify={notify}
			/>
		</>
	)
}

function Preview({
	entry,
	values,
	notify
}: PlaygroundProps & { values: DemoValues }) {
	return (
		<EmptyState
			title={values.title}
			description={values.description}
			illustration={entry.illustration(values.variant)}
			size={entry.size}
			animated={parseEntrance(values.animated)}
			pointer={parsePointer(values.pointer)}
			loop={parseLoop(entry, values.loop)}
			colors={colors}
			style={
				entry.size
					? undefined
					: {
							width: 'calc(100% - 32px)',
							maxWidth: 640,
							marginInline: 'auto'
						}
			}
			actions={
				values.showActions
					? entry.actions.map((action, index) => ({
							id: action.id,
							label: actionLabel(values, index),
							icon: action.icon,
							variant: action.variant,
							onClick: () =>
								notify(
									`${actionLabel(values, index)} clicked. Supply your own onClick handler in your app.`
								)
						}))
					: []
			}
			guidesTitle={entry.guides?.title}
			guides={
				entry.guides && values.showGuides
					? entry.guides.items.map(guide => ({
							id: guide.id,
							label: guide.label,
							icon: guide.icon,
							href: '#implementation'
						}))
					: []
			}
			link={
				entry.link && values.showLink
					? {
							label: (
								<>
									Learn more about{' '}
									<strong>{values.linkTopic}</strong>
								</>
							),
							href: '#implementation'
						}
					: undefined
			}
		/>
	)
}
