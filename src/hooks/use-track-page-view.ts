import { useLocation } from '@solidjs/router'
import { createEffect, onCleanup } from 'solid-js'

type TTrackingOptions = {
  debounceMs?: number
  userId?: string
  sessionId?: string
}

export function useTrackPageView(options: TTrackingOptions = {}) {
  const location = useLocation()
  const { debounceMs = 300, userId, sessionId } = options
  
  let debounceTimer: NodeJS.Timeout | null = null
  let lastTrackedPath = ''

  function trackPageView(pathname: string, referrer?: string) {
    // Skip if it's the same path to avoid duplicate tracking
    if (pathname === lastTrackedPath) {
      return
    }

    const payload = {
      eventType: 'pageview',
      page: pathname,
      userId,
      sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      referrer: referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
    }

    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      console.error('Failed to track page view:', error)
    })

    lastTrackedPath = pathname
  }

  function debouncedTrack(pathname: string, referrer?: string) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      trackPageView(pathname, referrer)
    }, debounceMs)
  }

  createEffect(() => {
    const currentPath = location.pathname
    const currentReferrer = typeof document !== 'undefined' ? document.referrer : undefined
    
    debouncedTrack(currentPath, currentReferrer)
  })

  onCleanup(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  })

  return {
    trackPageView: (pathname: string, referrer?: string) => debouncedTrack(pathname, referrer)
  }
}
