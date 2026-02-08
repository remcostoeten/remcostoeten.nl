"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PlaygroundToolbarProps {
  name: string
  description: string
}

export function PlaygroundToolbar({ name, description }: PlaygroundToolbarProps) {
  const router = useRouter()

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    toast("URL copied to clipboard")
  }

  return (
    <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight">{name}</h1>
          <p className="text-[11px] text-muted-foreground/60">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 rounded-none border-border/50 text-xs"
        onClick={copyUrl}
      >
        <LinkIcon className="h-3 w-3" />
        Copy URL
      </Button>
    </div>
  )
}
