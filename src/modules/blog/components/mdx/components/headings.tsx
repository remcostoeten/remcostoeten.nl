import React from 'react'
import { slugify } from '../utils/slugify'

/**
 * @name createHeading
 * @description Factory function that creates custom heading components (h1-h6). Each heading automatically generates a slug ID and adds an invisible anchor link that becomes visible on hover.
 */
export function createHeading(level: number) {
    const Heading = ({ children }: { children: React.ReactNode }) => {
        let slug = slugify(String(children))
        return React.createElement(
            `h${level}`,
            { id: slug },
            [
                React.createElement('a', {
                    href: `#${slug}`,
                    key: `link-${slug}`,
                    className: 'anchor'
                })
            ],
            children
        )
    }

    Heading.displayName = `Heading${level}`

    return Heading
}

