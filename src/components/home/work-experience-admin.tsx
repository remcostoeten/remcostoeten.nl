'use client'

import { useState, useTransition } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type {
	ExperienceItemType,
	ExperiencePositionItemType
} from '@/components/ui/work-experience'
import { saveWorkExperiences } from './work-experience-actions'

type Props = { initialValue: string }

type Company = Omit<ExperienceItemType, 'tagline'> & { tagline?: string }

const textareaClass =
	'w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function Field({
	label,
	children
}: {
	label: string
	children: React.ReactNode
}) {
	return (
		<label className="block space-y-1.5">
			<span className="text-xs font-medium text-muted-foreground">
				{label}
			</span>
			{children}
		</label>
	)
}

function move<T>(list: T[], from: number, to: number) {
	if (to < 0 || to >= list.length) return list
	const next = [...list]
	const [item] = next.splice(from, 1)
	next.splice(to, 0, item)
	return next
}

function newId(prefix: string) {
	return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function PositionEditor({
	position,
	onChange,
	onRemove
}: {
	position: ExperiencePositionItemType
	onChange: (next: ExperiencePositionItemType) => void
	onRemove: () => void
}) {
	function set<K extends keyof ExperiencePositionItemType>(
		key: K,
		value: ExperiencePositionItemType[K]
	) {
		onChange({ ...position, [key]: value })
	}

	return (
		<div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium">
					{position.title || 'Untitled position'}
				</p>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onRemove}
					aria-label="Remove position"
				>
					<Trash2Icon className="size-4" />
				</Button>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Title">
					<Input
						value={position.title}
						onChange={event => set('title', event.target.value)}
					/>
				</Field>
				<Field label="Period">
					<Input
						value={position.employmentPeriod}
						onChange={event =>
							set('employmentPeriod', event.target.value)
						}
					/>
				</Field>
				<Field label="Type">
					<Input
						value={position.employmentType ?? ''}
						onChange={event =>
							set('employmentType', event.target.value)
						}
					/>
				</Field>
				<Field label="Location">
					<Input
						value={position.location ?? ''}
						onChange={event => set('location', event.target.value)}
					/>
				</Field>
			</div>
			<Field label="Description (one bullet per line starting with '- ')">
				<textarea
					rows={6}
					className={`${textareaClass} font-mono text-xs`}
					value={position.description ?? ''}
					onChange={event => set('description', event.target.value)}
				/>
			</Field>
			<Field label="Skills (comma separated)">
				<Input
					value={(position.skills ?? []).join(', ')}
					onChange={event =>
						set(
							'skills',
							event.target.value
								.split(',')
								.map(skill => skill.trimStart())
						)
					}
					onBlur={() =>
						set(
							'skills',
							(position.skills ?? [])
								.map(skill => skill.trim())
								.filter(Boolean)
						)
					}
				/>
			</Field>
			<label className="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					checked={position.isExpanded ?? false}
					onChange={event => set('isExpanded', event.target.checked)}
				/>
				Expanded by default
			</label>
		</div>
	)
}

function CompanyEditor({
	company,
	index,
	count,
	allIds,
	onChange,
	onMove,
	onRemove
}: {
	company: Company
	index: number
	count: number
	allIds: string[]
	onChange: (next: Company) => void
	onMove: (to: number) => void
	onRemove: () => void
}) {
	const [open, setOpen] = useState(false)

	function set<K extends keyof Company>(key: K, value: Company[K]) {
		onChange({ ...company, [key]: value })
	}

	function setPosition(i: number, next: ExperiencePositionItemType) {
		set(
			'positions',
			company.positions.map((item, j) => (j === i ? next : item))
		)
	}

	return (
		<article className="rounded-2xl border border-border/50">
			<header className="flex items-center gap-3 p-4">
				<button
					type="button"
					onClick={() => setOpen(value => !value)}
					aria-expanded={open}
					className="min-w-0 flex-1 text-left"
				>
					<p className="truncate font-medium">
						{company.companyName || 'Untitled company'}
					</p>
					<p className="truncate font-mono text-xs text-muted-foreground">
						{company.positions.length} position
						{company.positions.length === 1 ? '' : 's'} ·{' '}
						{company.tagline}
					</p>
				</button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={index === 0}
					onClick={() => onMove(index - 1)}
					aria-label="Move up"
				>
					<ArrowUpIcon className="size-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={index === count - 1}
					onClick={() => onMove(index + 1)}
					aria-label="Move down"
				>
					<ArrowDownIcon className="size-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onRemove}
					aria-label="Remove company"
				>
					<Trash2Icon className="size-4" />
				</Button>
			</header>
			{open && (
				<div className="space-y-5 border-t border-border/50 p-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Company name">
							<Input
								value={company.companyName}
								onChange={event =>
									set('companyName', event.target.value)
								}
							/>
						</Field>
						<Field label="Id">
							<Input
								value={company.id}
								onChange={event =>
									set('id', event.target.value)
								}
							/>
						</Field>
						<Field label="Logo path">
							<Input
								value={company.companyLogo ?? ''}
								onChange={event =>
									set('companyLogo', event.target.value)
								}
							/>
						</Field>
						<Field label="Tagline">
							<Input
								value={company.tagline ?? ''}
								onChange={event =>
									set('tagline', event.target.value)
								}
							/>
						</Field>
						<Field label="Arrow points to">
							<select
								className={`${textareaClass} h-10`}
								value={company.taglineArrowTo ?? ''}
								onChange={event =>
									set(
										'taglineArrowTo',
										event.target.value || undefined
									)
								}
							>
								<option value="">No arrow</option>
								{allIds
									.filter(id => id !== company.id)
									.map(id => (
										<option key={id} value={id}>
											{id}
										</option>
									))}
							</select>
						</Field>
						<Field label="Arrow label">
							<Input
								value={company.taglineArrowLabel ?? ''}
								onChange={event =>
									set('taglineArrowLabel', event.target.value)
								}
							/>
						</Field>
					</div>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={company.isCurrentEmployer ?? false}
							onChange={event =>
								set('isCurrentEmployer', event.target.checked)
							}
						/>
						Current employer
					</label>
					<div className="space-y-3">
						{company.positions.map((position, i) => (
							<PositionEditor
								key={position.id}
								position={position}
								onChange={next => setPosition(i, next)}
								onRemove={() =>
									set(
										'positions',
										company.positions.filter(
											(_, j) => j !== i
										)
									)
								}
							/>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								set('positions', [
									...company.positions,
									{
										id: newId('position'),
										title: '',
										employmentPeriod: ''
									}
								])
							}
						>
							<PlusIcon className="mr-1 size-4" />
							Add position
						</Button>
					</div>
				</div>
			)}
		</article>
	)
}

export function WorkExperienceAdmin({ initialValue }: Props) {
	const [companies, setCompanies] = useState<Company[]>(() =>
		JSON.parse(initialValue)
	)
	const [raw, setRaw] = useState<string | null>(null)
	const [message, setMessage] = useState('')
	const [pending, startTransition] = useTransition()

	function toggleRaw() {
		if (raw === null) return setRaw(JSON.stringify(companies, null, 2))
		try {
			setCompanies(JSON.parse(raw))
			setRaw(null)
			setMessage('')
		} catch {
			setMessage('Fix the JSON before switching back.')
		}
	}

	function handleSave() {
		startTransition(async () => {
			const payload = raw ?? JSON.stringify(companies)
			const result = await saveWorkExperiences(payload)
			setMessage(result.success ? 'Experience saved.' : result.error)
		})
	}

	return (
		<section className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<Button type="button" disabled={pending} onClick={handleSave}>
					{pending ? 'Saving…' : 'Save experience'}
				</Button>
				<Button type="button" variant="outline" onClick={toggleRaw}>
					{raw === null ? 'Edit as JSON' : 'Back to form'}
				</Button>
				<p aria-live="polite" className="text-sm text-muted-foreground">
					{message}
				</p>
			</div>
			{raw !== null ? (
				<textarea
					aria-label="Work experience JSON"
					spellCheck={false}
					className="min-h-[36rem] w-full rounded-lg border border-border bg-background p-4 font-mono text-xs"
					value={raw}
					onChange={event => setRaw(event.target.value)}
				/>
			) : (
				<div className="space-y-3">
					{companies.map((company, index) => (
						<CompanyEditor
							key={`${company.id}-${index}`}
							company={company}
							index={index}
							count={companies.length}
							allIds={companies.map(item => item.id)}
							onChange={next =>
								setCompanies(
									companies.map((item, i) =>
										i === index ? next : item
									)
								)
							}
							onMove={to =>
								setCompanies(move(companies, index, to))
							}
							onRemove={() =>
								setCompanies(
									companies.filter((_, i) => i !== index)
								)
							}
						/>
					))}
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							setCompanies([
								...companies,
								{
									id: newId('company'),
									companyName: '',
									positions: []
								}
							])
						}
					>
						<PlusIcon className="mr-1 size-4" />
						Add company
					</Button>
				</div>
			)}
		</section>
	)
}
