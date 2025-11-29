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

  // Check if should show based on dismissed state
  const shouldShow = React.useMemo(() => {
    return !isDismissed
  }, [isDismissed])

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
        setIsDismissed(false)
      }

      storage.setItem(lastVisitKey, now)
    }
  }, [id, storage, resetOnVisit])

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

  const dismiss = React.useCallback(() => {
    if (!storage) return

    const dismissedKey = `${id}-dismissed`

    if (hideDelay > 0) {
      dismissTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        storage.setItem(dismissedKey, "true")
        setIsDismissed(true)
      }, hideDelay)
    } else {
      setIsVisible(false)
      storage.setItem(dismissedKey, "true")
      setIsDismissed(true)
    }
  }, [storage, id, hideDelay])

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
    setIsDismissed(false)
    setIsVisible(false)
    setIsAnimating(false)

    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current)
    }

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }
  }, [storage, id])

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
    shouldShow,
    setValue,
    getValue
  }
}