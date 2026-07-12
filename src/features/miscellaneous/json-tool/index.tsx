'use client'

import { EditorPanels } from './components/editor-panels'
import { Toolbar } from './components/toolbar'
import { useJsonToolStore } from './hooks/use-json-tool-store'

export default function JsonTool() {
	const store = useJsonToolStore()

	return (
		<div className="flex flex-col gap-3">
			<Toolbar store={store} />
			<EditorPanels store={store} />
		</div>
	)
}
