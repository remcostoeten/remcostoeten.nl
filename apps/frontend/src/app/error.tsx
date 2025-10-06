'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Center } from '@/shared/components/center'
import { AlertCircle } from 'lucide-react'

type TProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: TProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Center fullHeight className="bg-background">
      <div className="relative mx-auto max-w-xl text-center px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-primary" />
          Error
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">An error occurred while loading this page.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>Try again</Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </Center>
  )
}