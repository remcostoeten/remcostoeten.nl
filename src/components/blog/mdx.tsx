import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import { CodeBlock } from '../ui/code-block'
import { CollapsibleMedia } from './collapsible-media'
import { SpotifyEnvGenerator } from './spotify-env-generator'
import { SpotifyApiExplorer } from './spotify-api-explorer'
import {
  Notice,
  NoticeAlert,
  NoticeWarning,
  NoticeSuccess,
  NoticeInfo,
  NoticeNeutral,
  NoticeRegular
} from '../ui/notice'
import remarkGfm from 'remark-gfm'
import { rehypeExtractCodeMeta } from '@/lib/rehype-extract-code-meta'

// import BtwfyiDemo from './btwfyi-demo'

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
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

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-none AAAA" {...props} />
}

function Video({ src, ...props }: { src: string;[key: string]: any }) {
  return (
    <video
      src={src}
      controls
      preload="metadata"
      className="rounded-lg w-full max-w-2xl"
      {...props}
    >
      Your browser does not support the video tag.
    </video>
  )
}


function slugify(str) {
  if (!str || typeof str !== 'string') {
    return 'heading'
  }
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

function createHeading(level) {
  const Heading = ({ children }) => {
    if (!children) {
      return React.createElement(`h${level}`, {}, 'Heading')
    }

    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  Video,
  CollapsibleMedia,

  // BtwfyiDemo,
  a: CustomLink,
  Notice,
  NoticeAlert,
  NoticeWarning,
  NoticeSuccess,
  NoticeInfo,
  NoticeNeutral,
  NoticeRegular,
  SpotifyEnvGenerator,
  SpotifyApiExplorer,
  code: ({ children, ...props }) => {
    // Check if this is inline code (not inside a pre block)
    const isInline = !props.className?.includes('language-');
    if (isInline) {
      // Remove any backtick artifacts from inline code
      const content = typeof children === 'string'
        ? children.replace(/^`|`$/g, '')
        : children;
      return (
        <code
          className="rounded-md border border-border/50 bg-muted/60 px-1.5 py-0.5 text-sm font-mono break-words"
          {...props}
        >
          {content}
        </code>
      );
    }
    return <code {...props}>{children}</code>;
  },
  pre: ({ children, ...props }) => {
    const codeElement = children as React.ReactElement<any>;
    const code = codeElement?.props?.children || '';
    const className = codeElement?.props?.className || '';
    const language = className.replace('language-', '') || 'text';
    const metastring = codeElement?.props?.metastring || '';

    console.log('CodeBlock props:', { className, language, metastring });

    // Support both single and double quotes for filename and title
    const fileNameMatch = metastring.match(/filename=["']([^"']+)["']/);
    const titleMatch = metastring.match(/title=["']([^"']+)["']/);
    const fileName = fileNameMatch ? fileNameMatch[1] : (titleMatch ? titleMatch[1] : undefined);

    // Extract variant
    const variantMatch = metastring.match(/variant=["']([^"']+)["']/);
    const variant = variantMatch ? variantMatch[1] as "default" | "sharp" : undefined;

    console.log('Parsed fileName:', fileName, 'variant:', variant);

    const highlightMatch = metastring.match(/\{([\d,-]+)\}/);
    const highlightLines = highlightMatch
      ? highlightMatch[1].split(',').flatMap((v) => {
        if (v.includes('-')) {
          const [start, end] = v.split('-').map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [Number(v)];
      })
      : [];

    return (
      <CodeBlock
        code={code}
        language={language}
        fileName={fileName}
        highlightLines={highlightLines}
        variant={variant}
        {...props}
      />
    );
  },
  Table,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeExtractCodeMeta],
        },
      }}
    />
  )
}
