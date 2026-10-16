'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import {
	type AnimatedIconProps,
	installIconHover,
	playIcon
} from '@/components/animated-icons/icon-frame'
import {
	caps,
	ruleBottom,
	ruleTop,
	sectionClass,
	textButton
} from '@/components/resources/class-names'
import { SourcePanel } from '@/components/resources/source-panel'
import type { InstallMode, ResourceConfig } from '@/components/resources/types'
import type { IconEntry } from './entries'

type Trigger = 'hover' | 'click' | 'loop'

type Values = {
	size: string
	stroke: string
	trigger: Trigger
	on: boolean
}

type Props = {
	config: ResourceConfig
	entry: IconEntry
	notify: (message: string) => void
}

const sizeOptions = ['16', '20', '24', '32', '48'] as const
const strokeOptions = ['1', '1.5', '2'] as const
const triggerOptions: readonly Trigger[] = ['hover', 'click', 'loop']
const loopInterval = 1800
const reactImports: Record<Trigger, string> = {
	hover: 'useEffect',
	click: 'type MouseEvent',
	loop: 'useEffect, useRef'
}
const defaults: Values = {
	size: '48',
	stroke: '1.5',
	trigger: 'hover',
	on: false
}

const fieldLabel = 'font-mono text-[10px] text-muted-foreground'
const segment =
	'relative flex h-7 cursor-pointer select-none items-center justify-center rounded-[5px] px-1.5 font-sans text-[11px] capitalize text-muted-foreground transition-[background-color,color,box-shadow] duration-150 hover:text-foreground has-checked:bg-background has-checked:text-foreground has-checked:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--color-border)] has-focus-visible:ring-2 has-focus-visible:ring-foreground/25'
const toggleInput =
	'relative m-0 h-4 w-[27px] shrink-0 cursor-pointer appearance-none rounded-[10px] border border-border bg-border transition-colors checked:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 after:absolute after:top-0.5 after:left-0.5 after:size-2.5 after:rounded-full after:bg-(--color-surface) after:transition-transform checked:after:translate-x-[11px]'
const contextButton =
	'inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs text-foreground transition-colors hover:bg-foreground/4'

function parseTrigger(value: string): Trigger {
	return triggerOptions.find(option => option === value) ?? 'hover'
}

function importsFor(mode: InstallMode, entry: IconEntry, trigger: Trigger) {
	const base = mode === 'copy' ? '.' : '@/components/animated-icons'
	const helper = trigger === 'hover' ? 'installIconHover' : 'playIcon'
	return [
		`import { ${reactImports[trigger]} } from "react";`,
		`import { ${entry.component} } from "${base}/icons/${iconFile(entry)}";`,
		`import { ${helper} } from "${base}/icon-frame";`
	].join('\n')
}

function iconFile(entry: IconEntry) {
	return entry.component
		.replace(/^Animated|Icon$/g, '')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase()
}

function iconConfig(config: ResourceConfig, entry: IconEntry): ResourceConfig {
	const file = iconFile(entry)
	return {
		...config,
		registryItem: `animated-icon-${file}`,
		files: [`icons/${file}.tsx`, `icons/${file}.css`, ...config.files]
	}
}

function iconProps(entry: IconEntry, values: Values) {
	const props: string[] = []
	if (values.size !== '16') props.push(`size={${values.size}}`)
	if (values.stroke !== '1.5') props.push(`strokeWidth={${values.stroke}}`)
	if (entry.state && values.on) props.push(entry.state.prop)
	return props.length > 0 ? ` ${props.join(' ')}` : ''
}

function buildUsage(entry: IconEntry, values: Values) {
	const name = entry.component.replace(/^Animated|Icon$/g, '')
	const tag = `<${entry.component}${iconProps(entry, values)} />`

	if (values.trigger === 'click')
		return `export function ${name}Button() {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const icon = event.currentTarget.querySelector<SVGSVGElement>(".animated-icon");
    if (icon) playIcon(icon);
  }

  return (
    <button type="button" onClick={handleClick}>
      ${tag}
      ${entry.name}
    </button>
  );
}`

	if (values.trigger === 'loop')
		return `export function ${name}Loop() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (ref.current) playIcon(ref.current);
    }, ${loopInterval});
    return () => clearInterval(interval);
  }, []);

  return <${entry.component} ref={ref}${iconProps(entry, values)} />;
}`

	return `export function ${name}Button() {
  useEffect(() => installIconHover(), []);

  return (
    <button type="button" data-icon-trigger>
      ${tag}
      ${entry.name}
    </button>
  );
}`
}

function renderIcon(
	entry: IconEntry,
	values: Values,
	props: AnimatedIconProps
) {
	return entry.state ? (
		entry.state.render(values.on, props)
	) : (
		<entry.Icon {...props} />
	)
}

export function Playground({ config, entry, notify }: Props) {
	const [values, setValues] = useState(defaults)
	const fieldId = useId()
	const stageRef = useRef<HTMLDivElement>(null)
	const editedCount = (['size', 'stroke', 'trigger', 'on'] as const).filter(
		key => values[key] !== defaults[key]
	).length

	useEffect(() => installIconHover(), [])

	useEffect(() => {
		if (values.trigger !== 'loop') return
		const interval = setInterval(() => {
			const icon =
				stageRef.current?.querySelector<SVGSVGElement>('.animated-icon')
			if (icon) playIcon(icon)
		}, loopInterval)
		return () => clearInterval(interval)
	}, [values.trigger])

	function update<Key extends keyof Values>(key: Key, value: Values[Key]) {
		setValues(current => ({ ...current, [key]: value }))
	}

	function play() {
		const icon =
			stageRef.current?.querySelector<SVGSVGElement>('.animated-icon')
		if (icon) playIcon(icon)
	}

	const stageProps: AnimatedIconProps = {
		size: Number(values.size),
		strokeWidth: Number(values.stroke)
	}

	return (
		<>
			<section id="component" className={sectionClass}>
				<div className="overflow-hidden rounded-[10px] border border-border">
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
								{entry.summary}
							</span>
							<button
								type="button"
								className={textButton}
								onClick={play}
							>
								<Play strokeWidth={1.5} aria-hidden="true" />{' '}
								Play
							</button>
						</div>
						<div className="relative flex min-h-[200px] flex-1 flex-col items-center justify-center gap-4 py-6 overflow-hidden bg-background">
							<div
								className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[18px_18px] [mask-image:radial-gradient(ellipse_65%_70%_at_50%_45%,black,transparent)]"
								aria-hidden="true"
							/>
							<div ref={stageRef} className="relative">
								<button
									type="button"
									data-icon-trigger={
										values.trigger === 'hover'
											? ''
											: undefined
									}
									aria-label={`Play the ${entry.name} icon`}
									className="flex size-20 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-foreground/4 focus-visible:outline-none focus-visible:bg-foreground/6"
									onClick={() => {
										if (entry.state)
											update('on', !values.on)
										if (
											values.trigger === 'click' ||
											entry.state
										)
											play()
									}}
								>
									{renderIcon(entry, values, stageProps)}
								</button>
							</div>
							<div className="relative flex flex-wrap items-center justify-center gap-2">
								<button
									type="button"
									data-icon-trigger=""
									className={contextButton}
								>
									{renderIcon(entry, values, { size: 16 })}
									{entry.name}
								</button>
								<button
									type="button"
									data-icon-trigger=""
									aria-label={entry.name}
									className={`${contextButton} px-2`}
								>
									{renderIcon(entry, values, { size: 16 })}
								</button>
							</div>
							<p className="relative m-0 font-mono text-[10px] text-muted-foreground">
								{values.trigger === 'hover'
									? 'Hover or focus to play'
									: values.trigger === 'click'
										? 'Click to play'
										: `Plays every ${loopInterval / 1000}s`}
							</p>
						</div>
					</div>
					<aside
						className="scroll-mt-6 border-0 border-t border-border bg-(--color-surface)"
						aria-label="Customize the icon"
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
								onClick={() => setValues(defaults)}
								disabled={editedCount === 0}
							>
								<RotateCcw
									strokeWidth={1.5}
									aria-hidden="true"
								/>{' '}
								Reset
							</button>
						</div>
						<div className="grid gap-4 p-[18px] sm:grid-cols-3">
							<Segments
								name={`${fieldId}-size`}
								label="Size"
								options={sizeOptions}
								value={values.size}
								onChange={value => update('size', value)}
							/>
							<Segments
								name={`${fieldId}-stroke`}
								label="Stroke width"
								options={strokeOptions}
								value={values.stroke}
								onChange={value => update('stroke', value)}
							/>
							<Segments
								name={`${fieldId}-trigger`}
								label="Trigger"
								options={triggerOptions}
								value={values.trigger}
								onChange={value =>
									update('trigger', parseTrigger(value))
								}
							/>
						</div>
						<div className={`grid gap-[15px] p-[18px] ${ruleTop}`}>
							<p className={`m-0 ${fieldLabel}`}>
								Hugeicons {entry.hugeicon}
							</p>
							{entry.state && (
								<label className="flex items-center justify-between text-[11px]">
									<span>{entry.state.label}</span>
									<input
										className={toggleInput}
										type="checkbox"
										role="switch"
										checked={values.on}
										onChange={event => {
											update('on', event.target.checked)
											play()
										}}
									/>
								</label>
							)}
						</div>
					</aside>
				</div>
			</section>
			<SourcePanel
				config={iconConfig(config, entry)}
				importsFor={mode => importsFor(mode, entry, values.trigger)}
				usage={buildUsage(entry, values)}
				defaultUsage={buildUsage(entry, defaults)}
				notify={notify}
			/>
		</>
	)
}

type SegmentsProps = {
	name: string
	label: string
	options: readonly string[]
	value: string
	onChange: (value: string) => void
}

function Segments({ name, label, options, value, onChange }: SegmentsProps) {
	return (
		<fieldset className="m-0 min-w-0 border-0 p-0">
			<legend className={`mb-2 p-0 ${fieldLabel}`}>{label}</legend>
			<div className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-[7px] bg-foreground/5 p-0.5">
				{options.map(option => (
					<label key={option} className={segment}>
						<input
							className="sr-only"
							type="radio"
							name={name}
							value={option}
							checked={value === option}
							onChange={() => onChange(option)}
						/>
						{option}
					</label>
				))}
			</div>
		</fieldset>
	)
}
