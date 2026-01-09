import Link from 'next/link'
import React from 'react'

/**
 * @name CustomLink
 * @description Custom link component that handles different link types. Internal links use Next.js Link, anchor links use standard anchors, and external links open in new tabs with security attributes.
 */
interface CustomLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    children: React.ReactNode
}

export function CustomLink(props: CustomLinkProps) {
    let href = props.href

    // Internal Next.js routes - use Link component for client-side navigation
    if (href.startsWith('/')) {
        return (
            <Link href={href} {...props}>
                {props.children}
            </Link>
        )
    }

    // Anchor links for same-page navigation (e.g., #section-id)
    if (href.startsWith('#')) {
        return <a {...props} />
    }

    // External links - open in new tab with security and accessibility attributes
    const linkText = typeof props.children === 'string' ? props.children : 'external link'
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${linkText} (opens in new tab)`}
            {...props}
        />
    )
}

