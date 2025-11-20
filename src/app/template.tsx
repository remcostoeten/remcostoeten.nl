import { ViewTransition } from 'react'
import { viewTransitionsConfig } from '@/modules/view-transitions/config'

export default function Template({ children }: { children: React.ReactNode }) {
    // Only wrap with ViewTransition if enabled in config
    if (!viewTransitionsConfig.enabled) {
        return <>{children}</>
    }

    return <ViewTransition>{children}</ViewTransition>
}

