'use client'

import { useMemo, useRef, useState } from 'react'
import { CodeOutput } from './components/code-output'
import { ExportMenu } from './components/export-menu'
import { SvgDetail } from './components/svg-detail'
import { SvgInput } from './components/svg-input'
import { SvgList } from './components/svg-list'
import { useClipboard } from './hooks/use-clipboard'
import { useSvgCollection } from './hooks/use-svg-collection'
import { generateCombined } from './utilities/convert-collection'
import { generateComponent } from './utilities/convert-svg'
import { createRegistry } from './utilities/create-registry'
import {
	createIconPackage,
	createIndividualZip
} from './utilities/create-package'
import { downloadBlob, downloadText } from './utilities/download-file'
import type { ExportScope } from './types/svg-converter'
import { DEFAULT_SETTINGS } from './types/svg-converter'

export default function SvgConverter() {
	const collection = useSvgCollection()
	const clipboard = useClipboard()
	const [scope, setScope] = useState<ExportScope>('all')
	const [registry, setRegistry] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)
	const individual = useMemo(
		() => (collection.focused ? generateComponent(collection.focused) : ''),
		[collection.focused]
	)
	const scopedItems =
		scope === 'selected'
			? collection.items.filter(item => collection.selected.has(item.id))
			: collection.items
	const exportItems = scopedItems.filter(item => item.state !== 'invalid')

	async function paste() {
		const text = await clipboard.read()
		if (text !== undefined) collection.processImmediately(text)
	}

	function applyCurrent(targets: Iterable<string>) {
		if (collection.focused)
			collection.updateSettings(targets, collection.focused.settings)
	}

	function copyCombined() {
		void clipboard.copy(generateCombined(exportItems, registry))
	}
	function copyRegistry() {
		void clipboard.copy(createRegistry(exportItems))
	}

	return (
		<div
			ref={rootRef}
			className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[1560px] -translate-x-1/2 border-y border-border/70 bg-background p-3 md:p-4"
			onKeyDown={event => {
				if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
					event.preventDefault()
					if (collection.focused)
						collection.updateSettings([collection.focused.id], {
							format: true
						})
					clipboard.setMessage('Output formatted.')
				}
				if (
					(event.metaKey || event.ctrlKey) &&
					event.shiftKey &&
					event.key.toLowerCase() === 'c' &&
					individual
				) {
					event.preventDefault()
					void clipboard.copy(individual)
				}
			}}
		>
			<div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border/60 pb-3">
				<div>
					<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
						Local transformation bench
					</p>
					<h2 className="text-base font-semibold">SVG → React TSX</h2>
				</div>
				<p
					role="status"
					aria-live="polite"
					className="text-xs text-muted-foreground"
				>
					{clipboard.message ||
						'Nothing is uploaded. Source and exports stay in this browser.'}
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(340px,1fr)_minmax(420px,1.25fr)] xl:divide-x xl:divide-border/60">
				<div className="min-w-0 xl:pr-4">
					<SvgInput
						value={collection.input}
						message={collection.inputMessage}
						count={collection.items.length}
						onChange={collection.setInput}
						onImmediate={collection.processImmediately}
						onClear={collection.clear}
						onPaste={paste}
					/>
					<SvgList
						items={collection.items}
						selected={collection.selected}
						focusedId={collection.focusedId}
						onSelected={collection.setSelected}
						onFocus={collection.setFocusedId}
						onRemove={collection.remove}
						onReorder={collection.reorder}
					/>
				</div>
				<div className="min-w-0 xl:px-4">
					<SvgDetail
						item={collection.focused}
						selectedCount={collection.selected.size}
						onRename={value =>
							collection.focused &&
							collection.rename(collection.focused.id, value)
						}
						onFilename={value =>
							collection.focused &&
							collection.updateFilename(
								collection.focused.id,
								value
							)
						}
						onChange={patch =>
							collection.focused &&
							collection.updateSettings(
								[collection.focused.id],
								patch
							)
						}
						onApplySelected={() =>
							applyCurrent(collection.selected)
						}
						onApplyAll={() =>
							applyCurrent(collection.items.map(item => item.id))
						}
					/>
					<ExportMenu
						items={scopedItems}
						scope={scope}
						registry={registry}
						onScope={setScope}
						onRegistry={setRegistry}
						onCopyCombined={copyCombined}
						onCopyRegistry={copyRegistry}
						onDownloadCombined={() =>
							downloadText(
								generateCombined(exportItems, registry),
								'icons.tsx'
							)
						}
						onDownloadIndividuals={() =>
							downloadBlob(
								createIndividualZip(
									exportItems,
									generateComponent
								),
								'generated-icons.zip'
							)
						}
						onDownloadPackage={() =>
							downloadBlob(
								createIconPackage(exportItems),
								'generated-icons.zip'
							)
						}
					/>
				</div>
				<div className="min-w-0 xl:pl-4">
					<CodeOutput
						item={collection.focused}
						items={exportItems}
						individual={individual}
						registry={registry}
						onCopy={clipboard.copy}
						onDownload={downloadText}
						onFormat={() =>
							collection.focused &&
							collection.updateSettings([collection.focused.id], {
								format: true
							})
						}
						onReset={() =>
							collection.focused &&
							collection.updateSettings([collection.focused.id], {
								...DEFAULT_SETTINGS,
								primaryColor:
									collection.focused.colors[0]?.value
							})
						}
					/>
				</div>
			</div>
		</div>
	)
}
