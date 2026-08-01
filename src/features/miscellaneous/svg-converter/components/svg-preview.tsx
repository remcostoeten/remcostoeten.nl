import { createElement, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { convertAttribute } from '../utilities/convert-attributes'
import { normalizeColor } from '../utilities/detect-colors'
import type { SvgItem } from '../types/svg-converter'

function reactName(name: string): string {
	return convertAttribute(name, '').split('=')[0]
}

function styleProps(value: string): Record<string, string> {
	return Object.fromEntries(
		value.split(';').flatMap(part => {
			const separator = part.indexOf(':')
			if (separator < 1) return []
			const property = part
				.slice(0, separator)
				.trim()
				.replace(/-([a-z])/g, (_, letter: string) =>
					letter.toUpperCase()
				)
			return [[property, part.slice(separator + 1).trim()]]
		})
	)
}

function toReactNode(element: Element, key: string): ReactNode {
	const props: Record<string, unknown> = { key }
	for (const attribute of Array.from(element.attributes)) {
		if (/^xmlns(?::|$)/i.test(attribute.name)) continue
		const name = reactName(attribute.name)
		props[name] =
			name === 'style' ? styleProps(attribute.value) : attribute.value
	}
	const children = Array.from(element.childNodes).flatMap((node, index) => {
		if (node.nodeType === Node.ELEMENT_NODE)
			return [toReactNode(node as Element, `${key}-${index}`)]
		if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
			return [node.textContent.trim()]
		return []
	})
	return createElement(element.tagName, props, ...children)
}

type Props = { item: SvgItem }

export function SvgPreview({ item }: Props) {
	const [mode, setMode] = useState<'light' | 'dark'>('dark')
	const [size, setSize] = useState(160)
	const [zoom, setZoom] = useState(1)
	const [padding, setPadding] = useState(20)
	const [checkerboard, setCheckerboard] = useState(false)
	const [contrastColor, setContrastColor] = useState('#ffffff')
	const [replacePreview, setReplacePreview] = useState(true)
	const node = useMemo(() => {
		if (!item.markup) return null
		const document = new DOMParser().parseFromString(
			item.markup,
			'image/svg+xml'
		)
		const root = document.documentElement
		if (mode === 'dark' && replacePreview && item.settings.primaryColor) {
			for (const element of [
				root,
				...Array.from(root.querySelectorAll('*'))
			]) {
				for (const attribute of Array.from(element.attributes)) {
					if (
						['fill', 'stroke', 'stop-color'].includes(
							attribute.name.toLowerCase()
						) &&
						normalizeColor(attribute.value) ===
							normalizeColor(item.settings.primaryColor)
					)
						element.setAttribute(attribute.name, contrastColor)
				}
			}
		}
		root.setAttribute('width', '100%')
		root.setAttribute('height', '100%')
		return toReactNode(root, item.id)
	}, [
		item.id,
		item.markup,
		item.settings.primaryColor,
		mode,
		contrastColor,
		replacePreview
	])

	return (
		<section
			aria-labelledby="preview-title"
			className="border-b border-border/60 pb-4"
		>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2
						id="preview-title"
						className="text-xs font-semibold uppercase tracking-wider"
					>
						Preview
					</h2>
					<p className="text-[11px] text-muted-foreground">
						{item.width ?? 'auto'} × {item.height ?? 'auto'} ·{' '}
						{item.viewBox ?? 'No viewBox'}
					</p>
				</div>
				<div
					className="flex border"
					role="group"
					aria-label="Preview theme"
				>
					<button
						type="button"
						aria-pressed={mode === 'light'}
						onClick={() => setMode('light')}
						className={`px-2 py-1 text-xs ${mode === 'light' ? 'bg-foreground text-background' : ''}`}
					>
						Light
					</button>
					<button
						type="button"
						aria-pressed={mode === 'dark'}
						onClick={() => setMode('dark')}
						className={`px-2 py-1 text-xs ${mode === 'dark' ? 'bg-foreground text-background' : ''}`}
					>
						Dark
					</button>
				</div>
			</div>
			<div
				className={`grid min-h-64 place-items-center overflow-hidden border ${mode === 'dark' ? 'bg-[#111] text-white' : 'bg-white text-black'} ${checkerboard ? 'bg-[linear-gradient(45deg,#8882_25%,transparent_25%),linear-gradient(-45deg,#8882_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#8882_75%),linear-gradient(-45deg,transparent_75%,#8882_75%)] bg-[size:16px_16px]' : ''}`}
				style={{ padding }}
			>
				<div
					style={{
						width: size,
						height: size,
						transform: `scale(${zoom})`
					}}
					className="grid place-items-center transition-transform"
				>
					{node}
				</div>
			</div>
			<div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
				<label>
					Size{' '}
					<input
						className="mt-1 w-full accent-foreground"
						type="range"
						min="48"
						max="240"
						value={size}
						onChange={event => setSize(Number(event.target.value))}
					/>
				</label>
				<label>
					Zoom{' '}
					<input
						className="mt-1 w-full accent-foreground"
						type="range"
						min="0.5"
						max="2"
						step="0.1"
						value={zoom}
						onChange={event => setZoom(Number(event.target.value))}
					/>
				</label>
				<label>
					Padding{' '}
					<input
						className="mt-1 w-full accent-foreground"
						type="range"
						min="0"
						max="48"
						value={padding}
						onChange={event =>
							setPadding(Number(event.target.value))
						}
					/>
				</label>
				<div className="flex items-end gap-3">
					<label className="flex items-center gap-1.5">
						<input
							type="checkbox"
							checked={checkerboard}
							onChange={event =>
								setCheckerboard(event.target.checked)
							}
						/>
						Transparency
					</label>
					{mode === 'dark' ? (
						<label className="flex items-center gap-1.5">
							Contrast{' '}
							<input
								aria-label="Dark preview contrast color"
								type="color"
								value={contrastColor}
								onChange={event =>
									setContrastColor(event.target.value)
								}
							/>
						</label>
					) : null}
				</div>
			</div>
			{mode === 'dark' ? (
				<label className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
					<input
						type="checkbox"
						checked={replacePreview}
						onChange={event =>
							setReplacePreview(event.target.checked)
						}
					/>
					Replace the primary color for contrast. The selected preview
					color is used only for previewing.
				</label>
			) : null}
		</section>
	)
}
