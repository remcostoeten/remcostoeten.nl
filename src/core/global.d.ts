import type { ReactNode } from 'react'

declare global {
    /**
     * @name PageProps
     * @description Global props type for page and layout components.
     * Used for route-level components that only accept renderable children.
     */
    type Child = {
        children: ReactNode
    }
}

export { }
