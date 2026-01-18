"use client"

import { useState, useTransition } from "react"
import type { ProjectSettings } from "../../../server/db/project-schema"
import { updateSettings } from "../server/mutations"

type Props = {
  settings: ProjectSettings
  onUpdate: (settings: ProjectSettings) => void
}

export function SettingsPanel({ settings, onUpdate }: Props) {
  const [showN, setShowN] = useState(settings.showN)
  const [isPending, startTransition] = useTransition()
  const hasChanges = showN !== settings.showN

  function handleSave() {
    startTransition(async () => {
      const result = await updateSettings(showN)
      if (result.success) {
        onUpdate({ ...settings, showN })
      }
    })
  }

  return (
    <div className="border border-zinc-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Show when collapsed:</span>
          <input
            type="number"
            min={1}
            max={50}
            value={showN}
            onChange={(e) => setShowN(Number(e.target.value))}
            className="w-20 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
          />
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-3 py-1.5 text-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  )
}
