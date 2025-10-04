'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AnimatedNumberDemo = dynamic(
  () => import('@/components/blog/animated-number-demo').then(mod => ({ default: mod.AnimatedNumberDemo })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-4xl mx-auto p-6 animate-pulse bg-muted/10 rounded-lg border" style={{ height: '400px' }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="h-6 bg-muted rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded-md w-64"></div>
        </div>
      </div>
    )
  }
)

export function ClientAnimatedNumberDemo() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-4xl mx-auto p-6 animate-pulse bg-muted/10 rounded-lg border" style={{ height: '400px' }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="h-6 bg-muted rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded-md w-64"></div>
        </div>
      </div>
    }>
      <AnimatedNumberDemo />
    </Suspense>
  )
}