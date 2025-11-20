/**
 * @name CustomMDX
 * @description MDX component renderer for blog posts with custom components and syntax highlighting.
 * 
 * This module provides a custom MDX implementation that:
 * - Renders MDX content with Next.js MDXRemote
 * - Provides custom components for links, images, code blocks, tables, and headings
 * - Adds syntax highlighting to code blocks
 * - Generates anchor links for headings
 * - Handles internal, external, and anchor links appropriately
 * 
 * @module modules/blog/components/mdx
 */

import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'

/**
 * @name Table
 * @description Renders a table from MDX table data structure.
 * Converts MDX table data format into semantic HTML table elements.
 * @param data - Object containing headers array and rows array of arrays
 */
function Table({ data }) {
    let headers = data.headers.map((header, index) => <th key={index}>{header}</th>)
    let rows = data.rows.map((row, index) => (
        <tr key={index}>
            {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
            ))}
        </tr>
    ))

    return (
        <table>
            <thead>
                <tr>{headers}</tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    )
}

/**
 * @name CustomLink
 * @description Custom link component that handles different link types:
 * - Internal links (starting with '/') → Uses Next.js Link for client-side navigation
 * - Anchor links (starting with '#') → Standard anchor tag for same-page navigation
 * - External links → Opens in new tab with security attributes and accessibility labels
 * 
 * All external links include:
 * - target="_blank" for new tab
 * - rel="noopener noreferrer" for security
 * - aria-label with "(opens in new tab)" for screen readers
 */
function CustomLink(props) {
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

/**
 * @name RoundedImage
 * @description Custom image component that wraps Next.js Image with rounded corners.
 * Ensures all images in blog posts have consistent styling.
 * @param props - Image props including required alt text
 */
function RoundedImage(props) {
    return <Image alt={props.alt} className="rounded-lg" {...props} />
}

/**
 * @name Code
 * @description Code block component with syntax highlighting using sugar-high library.
 * Renders highlighted code HTML directly into a code element.
 * @param children - The code content to highlight
 * @param props - Additional props to pass to the code element
 */
function Code({ children, ...props }) {
    let codeHTML = highlight(children)
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

/**
 * @name slugify
 * @description Converts a string into a URL-friendly slug.
 * Used for generating anchor IDs from heading text.
 * 
 * Process:
 * 1. Convert to lowercase
 * 2. Trim whitespace
 * 3. Replace spaces with hyphens
 * 4. Replace & with '-and-'
 * 5. Remove non-word characters
 * 6. Collapse multiple hyphens into single hyphen
 * 
 * @param str - String to convert to slug
 * @returns URL-friendly slug string
 */
function slugify(str) {
    return str
        .toString()
        .toLowerCase()
        .trim() // Remove whitespace from both ends of a string
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

/**
 * @name createHeading
 * @description Factory function that creates custom heading components (h1-h6).
 * Each heading automatically:
 * - Generates a slug ID from the heading text
 * - Adds an invisible anchor link that becomes visible on hover
 * - Enables direct linking to specific sections
 * 
 * The anchor link uses the 'anchor' CSS class which is styled in global.css
 * to be invisible by default and visible on hover.
 * 
 * @param level - Heading level (1-6)
 * @returns React component for that heading level
 */
function createHeading(level) {
    const Heading = ({ children }) => {
        let slug = slugify(children)
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

/**
 * Component mapping for MDX rendering.
 * Maps standard MDX elements to custom components:
 * - h1-h6 → Auto-anchored headings
 * - Image → Rounded image component
 * - a → Custom link handler
 * - code → Syntax-highlighted code blocks
 * - Table → Semantic table component
 */
let components = {
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    h4: createHeading(4),
    h5: createHeading(5),
    h6: createHeading(6),
    Image: RoundedImage,
    a: CustomLink,
    code: Code,
    Table
}

/**
 * @name CustomMDX
 * @description Main MDX renderer component that wraps MDXRemote with custom components.
 * Allows passing additional custom components via props for extensibility.
 * 
 * @param props - MDXRemote props including source content and optional custom components
 * @returns Rendered MDX content with custom components applied
 */
export function CustomMDX(props) {
    return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}
