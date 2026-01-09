/**
 * @name CustomMDX
 * @description MDX component renderer for blog posts with custom components and syntax highlighting. Provides custom components for links, images, code blocks, tables, and headings with anchor links.
 */
import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createHeading, Table, CustomLink, RoundedImage, Code } from './components'

/**
 * Component mapping for MDX rendering.
 * Maps standard MDX elements to custom components:
 * - h1-h6 → Auto-anchored headings
 * - Image → Rounded image component
 * - a → Custom link handler
 * - code → Syntax-highlighted code blocks
 * - Table → Semantic table component
 */
const components = {
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

interface CustomMDXProps {
    source: string
    components?: Record<string, React.ComponentType<any>>
    [key: string]: any
}

export function CustomMDX(props: CustomMDXProps) {
    return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}

