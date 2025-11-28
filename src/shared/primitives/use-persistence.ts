"use client"

import * as React from "react"

export type TStorageType = "localStorage" | "sessionStorage" | "cookie"

export interface TUsePersistenceOptions {
  id: string
  storageType?: TStorageType
  cookieOptions?: {
    maxAge?: number
    expires?: Date
    secure?: boolean
    httpOnly?: boolean
    sameSite?: "strict" | "lax" | "none"
    path?: string
    domain?: string
  }
  autoShow?: boolean
  showDelay?: number
  hideDelay?: number
  resetOnVisit?: boolean
  maxDismissals?: number
  dismissCountKey?: string
  defaultValue?: boolean
}

export interface TUsePersistenceReturn {
  isVisible: boolean
  isDismissed: boolean
  isAnimating: boolean
  show: () => void
  hide: () => void
  dismiss: () => void
  toggle: () => void
  reset: () => void
  getDismissCount: () => number
  canShow: () => boolean
  shouldShow: boolean
  setValue: (value: boolean) => void
  getValue: () => boolean
}

export function usePersistence({
  id,
  storageType = "localStorage",
  cookieOptions = {},
  autoShow = true,
  showDelay = 0,
  hideDelay = 0,
  resetOnVisit = false,
  maxDismissals = Infinity,
  dismissCountKey = `${id}-dismiss-count`,
  defaultValue = false
}: TUsePersistenceOptions): TUsePersistenceReturn {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const dismissTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const showTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Storage helpers
  const storage = React.useMemo(() => {
    if (typeof window === "undefined") return null

    switch (storageType) {
      case "sessionStorage":
        return window.sessionStorage
      case "localStorage":
      default:
        return window.localStorage
      case "cookie":
        return {
          getItem: (key: string) => {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${key}=`)
            if (parts.length === 2) return parts.pop()?.split(';').shift()
            return null
          },
          setItem: (key: string, value: string) => {
            let cookieString = `${key}=${value}`

            if (cookieOptions.maxAge) {
              cookieString += `; max-age=${cookieOptions.maxAge}`
            }

            if (cookieOptions.expires) {
              cookieString += `; expires=${cookieOptions.expires.toUTCString()}`
            }

            if (cookieOptions.path) {
              cookieString += `; path=${cookieOptions.path}`
            }

            if (cookieOptions.domain) {
              cookieString += `; domain=${cookieOptions.domain}`
            }

            if (cookieOptions.secure) {
              cookieString += `; secure`
            }

            if (cookieOptions.httpOnly) {
              console.warn("httpOnly cookies can only be set server-side")
            }

            if (cookieOptions.sameSite) {
              cookieString += `; samesite=${cookieOptions.sameSite}`
            }

            document.cookie = cookieString
          },
          removeItem: (key: string) => {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          }
        }
    }
  }, [storageType, cookieOptions])

  // Get dismiss count
  const getDismissCount = React.useCallback((): number => {
    if (!storage) return 0
    const count = storage.getItem(dismissCountKey)
    return count ? parseInt(count, 10) : 0
  }, [storage, dismissCountKey])

  // Increment dismiss count
  const incrementDismissCount = React.useCallback(() => {
    if (!storage) return
    const currentCount = getDismissCount()
    const newCount = currentCount + 1
    storage.setItem(dismissCountKey, newCount.toString())
  }, [storage, dismissCountKey, getDismissCount])

  // Check if announcement can be shown
  const canShow = React.useCallback((): boolean => {
    const dismissCount = getDismissCount()
    return dismissCount < maxDismissals
  }, [getDismissCount, maxDismissals])

  // Check if should show based on dismissed state and dismiss count
  const shouldShow = React.useMemo(() => {
    if (!canShow()) return false
    return !isDismissed
  }, [isDismissed, canShow])

  // Initialize dismissed state from storage
  React.useEffect(() => {
    if (!storage) return

    const dismissedKey = `${id}-dismissed`
    const wasDismissed = storage.getItem(dismissedKey) === "true"
    const lastVisitKey = `${id}-last-visit`

    setIsDismissed(wasDismissed)

    if (resetOnVisit && wasDismissed) {
      const lastVisit = storage.getItem(lastVisitKey)
      const now = new Date().toISOString()

      // Reset if it's a new day
      if (lastVisit && new Date(lastVisit).toDateString() !== new Date(now).toDateString()) {
        storage.setItem(dismissedKey, "false")
        storage.setItem(dismissCountKey, "0")
        setIsDismissed(false)
      }

      storage.setItem(lastVisitKey, now)
    }
  }, [id, storage, resetOnVisit, dismissCountKey])

  // Auto-show logic
  React.useEffect(() => {
    if (autoShow && shouldShow && !isVisible) {
      if (showDelay > 0) {
        showTimeoutRef.current = setTimeout(() => {
          show()
        }, showDelay)
      } else {
        show()
      }
    }

    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
      }
    }
  }, [autoShow, shouldShow, showDelay, isVisible])

  // Show announcement
  const show = React.useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setIsVisible(true)

    setTimeout(() => {
      setIsAnimating(false)
    }, 100)
  }, [isAnimating])

  // Hide announcement
  const hide = React.useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)

    setTimeout(() => {
      setIsVisible(false)
      setIsAnimating(false)
    }, hideDelay)
  }, [isAnimating, hideDelay])

  // Dismiss announcement (permanent hide)
  const dismiss = React.useCallback(() => {
    if (!storage) return

    const dismissedKey = `${id}-dismissed`

    if (hideDelay > 0) {
      dismissTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        storage.setItem(dismissedKey, "true")
        incrementDismissCount()
      }, hideDelay)
    } else {
      setIsVisible(false)
      storage.setItem(dismissedKey, "true")
      incrementDismissCount()
    }
  }, [storage, id, hideDelay, incrementDismissCount])

  // Toggle visibility
  const toggle = React.useCallback(() => {
    if (isVisible) {
      hide()
    } else if (shouldShow) {
      show()
    }
  }, [isVisible, shouldShow, show, hide])

  // Reset announcement
  const reset = React.useCallback(() => {
    if (!storage) return

    const dismissedKey = `${id}-dismissed`
    storage.setItem(dismissedKey, "false")
    storage.setItem(dismissCountKey, "0")
    setIsDismissed(false)
    setIsVisible(false)
    setIsAnimating(false)

    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current)
    }

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }
  }, [storage, id, dismissCountKey])

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current)
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
      }
    }
  }, [])

  // Generic get/set methods for any boolean state
  const setValue = React.useCallback((value: boolean) => {
    if (value) {
      show()
    } else {
      hide()
    }
  }, [show, hide])

  const getValue = React.useCallback((): boolean => {
    return isVisible
  }, [isVisible])

  return {
    isVisible,
    isDismissed,
    isAnimating,
    show,
    hide,
    dismiss,
    toggle,
    reset,
    getDismissCount,
    canShow,
    shouldShow,
    setValue,
    getValue
  }
}