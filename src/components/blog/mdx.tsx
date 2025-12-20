import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import { CodeBlock } from '../ui/code-block'
import { CollapsibleMedia } from './collapsible-media'
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
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}


function slugify(str) {
  if (!str || typeof str !== 'string') {
    return 'heading'
  }
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
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
  CollapsibleMedia,
  a: CustomLink,
  Notice,
  NoticeAlert,
  NoticeWarning,
  NoticeSuccess,
  NoticeInfo,
  NoticeNeutral,
  NoticeRegular,
  pre: ({ children, ...props }) => {
    const codeElement = children as React.ReactElement<any>;
    const code = codeElement?.props?.children || '';
    const className = codeElement?.props?.className || '';
    const language = className.replace('language-', '') || 'text';
    const metastring = codeElement?.props?.metastring || '';

    // Extract fileName from metastring (e.g., `filename="index.ts"`)
    const fileNameMatch = metastring.match(/filename="([^"]+)"/);
    const fileName = fileNameMatch ? fileNameMatch[1] : undefined;

    // Extract highlighted lines from metastring (e.g., `{1,3-5}`)
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
          rehypePlugins: [],
        },
      }}
    />
  )
}
