'use client'

import { useCallback, useMemo, useState } from 'react'
import {
	BookmarkPlus,
	Check,
	Copy,
	ExternalLink,
	Loader2,
	LocateFixed,
	RotateCcw,
	TriangleAlert
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard'
import { SendToTool } from '../components/send-to-tool'
import { geolocationErrorMessage, locate } from '../utils/geolocation'
import type { TLocationPoint } from '../utils/location-handoff'
import { appendSavedLocation, locationLabel } from '../utils/locations'
import { reverseGeocode } from '../utils/reverse-geocode'
import type { TGeocodedAddress } from '../utils/reverse-geocode'

type TLocation = TGeocodedAddress & {
	lat: number
	lng: number
	accuracy: number
	timestamp: number
}

type TStatus = 'idle' | 'locating' | 'ready' | 'error'

type TField = {
	key: string
	label: string
	value: string
}

function formatCoordinate(value: number): string {
	return value.toFixed(6)
}

function toFields(location: TLocation): TField[] {
	const candidates: TField[] = [
		{
			key: 'latitude',
			label: 'Latitude',
			value: formatCoordinate(location.lat)
		},
		{
			key: 'longitude',
			label: 'Longitude',
			value: formatCoordinate(location.lng)
		},
		{
			key: 'coordinates',
			label: 'Coordinates',
			value: `${formatCoordinate(location.lat)}, ${formatCoordinate(location.lng)}`
		},
		{
			key: 'accuracy',
			label: 'Accuracy',
			value: `± ${Math.round(location.accuracy)} m`
		},
		{ key: 'street', label: 'Street', value: location.street ?? '' },
		{
			key: 'houseNumber',
			label: 'House number',
			value: location.houseNumber ?? ''
		},
		{ key: 'postcode', label: 'Postcode', value: location.postcode ?? '' },
		{ key: 'city', label: 'City', value: location.city ?? '' },
		{ key: 'region', label: 'Region', value: location.region ?? '' },
		{ key: 'country', label: 'Country', value: location.country ?? '' },
		{ key: 'address', label: 'Full address', value: location.address ?? '' }
	]

	return candidates.filter(field => field.value !== '')
}

function toPlainText(fields: TField[]): string {
	return fields.map(field => `${field.label}: ${field.value}`).join('\n')
}

function toJson(location: TLocation): string {
	return JSON.stringify(
		{
			latitude: location.lat,
			longitude: location.lng,
			accuracyMeters: Math.round(location.accuracy),
			street: location.street,
			houseNumber: location.houseNumber,
			postcode: location.postcode,
			city: location.city,
			region: location.region,
			country: location.country,
			address: location.address,
			capturedAt: new Date(location.timestamp).toISOString()
		},
		null,
		2
	)
}

function FieldRow({
	field,
	copiedKey,
	onCopy
}: {
	field: TField
	copiedKey: string | null
	onCopy: (field: TField) => void
}) {
	const copied = copiedKey === field.key

	return (
		<div className="flex items-start justify-between gap-3 border-b border-border/50 px-3 py-2 last:border-b-0">
			<div className="min-w-0">
				<p className="text-xs text-muted-foreground">{field.label}</p>
				<p className="mt-0.5 break-words font-mono text-sm text-foreground">
					{field.value}
				</p>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-7 shrink-0 gap-1 px-2 text-xs"
				onClick={() => onCopy(field)}
				aria-label={`Copy ${field.label}`}
			>
				{copied ? (
					<Check aria-hidden className="size-3" />
				) : (
					<Copy aria-hidden className="size-3" />
				)}
				{copied ? 'Copied' : 'Copy'}
			</Button>
		</div>
	)
}

export default function MyLocationTool() {
	const [status, setStatus] = useState<TStatus>('idle')
	const [location, setLocation] = useState<TLocation | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [savedId, setSavedId] = useState<string | null>(null)
	const { copy, copiedKey } = useCopyToClipboard()

	const detect = useCallback(async () => {
		setStatus('locating')
		setError(null)
		setSavedId(null)

		try {
			const fix = await locate()

			setLocation(fix)
			setStatus('ready')

			const address = await reverseGeocode(fix.lat, fix.lng)
			setLocation(previous =>
				previous ? { ...previous, ...address } : previous
			)
		} catch (cause) {
			setStatus('error')
			setError(geolocationErrorMessage(cause))
		}
	}, [])

	const fields = useMemo(
		() => (location ? toFields(location) : []),
		[location]
	)

	const handleCopyField = useCallback(
		(field: TField) => {
			copy(field.value, field.key, `${field.label} copied`)
		},
		[copy]
	)

	function saveAsPin() {
		if (!location || savedId) return
		const saved = appendSavedLocation(location)
		setSavedId(saved.id)
		toast.success('Saved to your pins')
	}

	function currentAsPoints(): TLocationPoint[] {
		if (!location) return []
		return [
			{
				id: savedId ?? 'my-location',
				lat: location.lat,
				lng: location.lng,
				label: location.city
					? locationLabel(location)
					: 'My location'
			}
		]
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					onClick={detect}
					disabled={status === 'locating'}
					className="gap-2"
				>
					{status === 'locating' ? (
						<Loader2 aria-hidden className="size-4 animate-spin" />
					) : status === 'ready' ? (
						<RotateCcw aria-hidden className="size-4" />
					) : (
						<LocateFixed aria-hidden className="size-4" />
					)}
					{status === 'locating'
						? 'Locating…'
						: status === 'ready'
							? 'Refresh location'
							: 'Detect my location'}
				</Button>

				{location && (
					<>
						<Button
							type="button"
							variant="outline"
							className="gap-2"
							onClick={() =>
								copy(toPlainText(fields), 'all', 'All values copied')
							}
						>
							{copiedKey === 'all' ? (
								<Check aria-hidden className="size-4" />
							) : (
								<Copy aria-hidden className="size-4" />
							)}
							Copy all
						</Button>
						<Button
							type="button"
							variant="outline"
							className="gap-2"
							onClick={() =>
								copy(toJson(location), 'json', 'JSON copied')
							}
						>
							{copiedKey === 'json' ? (
								<Check aria-hidden className="size-4" />
							) : (
								<Copy aria-hidden className="size-4" />
							)}
							Copy as JSON
						</Button>
						<Button
							type="button"
							variant="outline"
							className="gap-2"
							onClick={saveAsPin}
							disabled={!!savedId}
							title="Save this position to your shared pins"
						>
							{savedId ? (
								<Check aria-hidden className="size-4" />
							) : (
								<BookmarkPlus aria-hidden className="size-4" />
							)}
							{savedId ? 'Saved as pin' : 'Save as pin'}
						</Button>
						<SendToTool
							from="my-location"
							points={currentAsPoints}
							size="default"
						/>
					</>
				)}
			</div>

			<p aria-live="polite" className="sr-only">
				{status === 'locating'
					? 'Locating you'
					: status === 'ready'
						? 'Location found'
						: status === 'error'
							? (error ?? 'Location failed')
							: ''}
			</p>

			{status === 'error' && error && (
				<div
					role="alert"
					className="flex items-start gap-2 border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground"
				>
					<TriangleAlert
						aria-hidden
						className="mt-0.5 size-4 shrink-0 text-destructive"
					/>
					<p>{error}</p>
				</div>
			)}

			{status === 'idle' && (
				<div className="border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
					Your browser will ask for permission. Coordinates are resolved to
					an address via OpenStreetMap, and only stored if you save them
					as a pin or send them to another tool.
				</div>
			)}

			{location && (
				<div className="flex flex-col gap-3">
					<div className="border border-border/50 bg-card">
						{fields.map(field => (
							<FieldRow
								key={field.key}
								field={field}
								copiedKey={copiedKey}
								onCopy={handleCopyField}
							/>
						))}
					</div>

					<div className="flex flex-wrap gap-3 text-xs">
						<a
							href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
						>
							Open in Google Maps
							<ExternalLink aria-hidden className="size-3" />
						</a>
						<a
							href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=17/${location.lat}/${location.lng}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
						>
							Open in OpenStreetMap
							<ExternalLink aria-hidden className="size-3" />
						</a>
					</div>
				</div>
			)}
		</div>
	)
}
