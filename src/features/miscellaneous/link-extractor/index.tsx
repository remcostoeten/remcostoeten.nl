'use client'

import { FilterControls } from './components/filter-controls'
import { InputPanel } from './components/input-panel'
import { OutputPanel } from './components/output-panel'
import { useLinkExtractorStore } from './hooks/use-link-extractor-store'

export default function LinkExtractorTool() {
	const store = useLinkExtractorStore()

	return (
		<div className="flex flex-col gap-3">
			<FilterControls store={store} />
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<InputPanel store={store} />
				<OutputPanel store={store} />
			</div>
		</div>
	)
}
