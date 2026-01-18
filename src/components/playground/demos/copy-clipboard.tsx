'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyToClipboardDemo() {
    const [copied, setCopied] = useState(false)
    const textToCopy = "npm install my-awesome-package"

    async function handleCopy() {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(function resetCopied() {
            setCopied(false)
        }, 2000)
    }

    return (
        <div className="p-6 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-border/50 bg-muted/20">
                <code className="text-xs text-muted-foreground flex-1 font-mono">{textToCopy}</code>
                <button
                    onClick={handleCopy}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
            <p className="text-[10px] text-muted-foreground/40">Click to copy • Auto-resets after 2s</p>
        </div>
    )
}
