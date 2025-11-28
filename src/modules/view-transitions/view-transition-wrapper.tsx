'use client'

import { ViewTransition } from 'react'
import { viewTransitionsConfig } from './config'
import { useState, useEffect } from 'react'

/**
 * Client-side ViewTransition wrapper
 * 
 * Prevents hydration mismatches by only applying ViewTransition on the client
 * after the component has mounted.
 */
export function ViewTransitionWrapper({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!viewTransitionsConfig.enabled || !isMounted) {
        return <>{children}</>
    }

    return <ViewTransition>{children}</ViewTransition>
}



