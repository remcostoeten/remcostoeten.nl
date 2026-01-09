'use client'

import { viewTransitionsConfig } from './config'
import { useEffect } from 'react'

/**
 * View Transitions Provider
 * 
 * Injects CSS variables and data attributes based on config.ts
 * This allows CSS to dynamically respond to config changes
 */
export function ViewTransitionsProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!viewTransitionsConfig.enabled) {
            return
        }

        const root = document.documentElement

        // Set transition type as data attribute for CSS targeting
        root.setAttribute('data-view-transition-type', viewTransitionsConfig.type)

        // Set CSS variables for dynamic values
        const duration = viewTransitionsConfig.duration[viewTransitionsConfig.type] || 300
        const easing = viewTransitionsConfig.easing[viewTransitionsConfig.type] || 'cubic-bezier(0, 0, 0.2, 1)'
        const fadeInDelay = viewTransitionsConfig.fadeInDelay || 90

        root.style.setProperty('--vt-duration', `${duration}ms`)
        root.style.setProperty('--vt-easing', easing)
        root.style.setProperty('--vt-fade-in-delay', `${fadeInDelay}ms`)
        root.style.setProperty('--vt-fade-out-duration', `${duration * 0.3}ms`)
        root.style.setProperty('--vt-fade-in-duration', `${duration * 0.7}ms`)

        return () => {
            root.removeAttribute('data-view-transition-type')
            root.style.removeProperty('--vt-duration')
            root.style.removeProperty('--vt-easing')
            root.style.removeProperty('--vt-fade-in-delay')
            root.style.removeProperty('--vt-fade-out-duration')
            root.style.removeProperty('--vt-fade-in-duration')
        }
    }, [])

    return <>{children}</>
}

