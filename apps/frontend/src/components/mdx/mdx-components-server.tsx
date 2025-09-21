import React from 'react';
import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';
// Import server-safe components
import { InlineCode } from './CodeBlock';
import { ServerCodeBlock } from './ServerCodeBlock';
import { Callout } from './Callout';
import { ImageWithCaption } from './ImageWithCaption';
import { EnhancedTable } from './EnhancedTable';
import { generateHeadingId, sanitizeHeadingText } from '@/lib/blog/toc-utils';

// Server-safe MDX components without error boundaries
export const mdxComponents: MDXComponents = {
  h1: ({ children, className, id, ...props }) => {
    const headingId = id || generateHeadingId(sanitizeHeadingText(String(children)));
    return (
      <h1 
        id={headingId}
        className={cn("text-4xl lg:text-5xl font-bold text-foreground mb-6 mt-8 first:mt-0 scroll-m-20", className)}
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ children, className, id, ...props }) => {
    const headingId = id || generateHeadingId(sanitizeHeadingText(String(children)));
    return (
      <h2 
        id={headingId}
        className={cn("text-3xl font-semibold text-foreground mb-4 mt-8 first:mt-0 scroll-m-20", className)}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, className, id, ...props }) => {
    const headingId = id || generateHeadingId(sanitizeHeadingText(String(children)));
    return (
      <h3 
        id={headingId}
        className={cn("text-2xl font-semibold text-foreground mb-3 mt-6 first:mt-0 scroll-m-20", className)}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, className, id, ...props }) => {
    const headingId = id || generateHeadingId(sanitizeHeadingText(String(children)));
    return (
      <h4 
        id={headingId}
        className={cn("text-xl font-semibold text-foreground mb-2 mt-4 first:mt-0 scroll-m-20", className)}
        {...props}
      >
        {children}
      </h4>
    );
  },
  h5: ({ children, className, id, ...props }) => {
    const headingId = id || generateHeadingId(sanitizeHeadingText(String(children)));
    return (
      <h5 
        id={headingId}
        className={cn("text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0 scroll-m-20", className)}
        {...props}
      >
        {children}
      </h5>
    );
  },
  h6: ({ children, className, id, ...props }) => {
    const headingId = id || generateHeadingId(sanitizeHeadingText(String(children)));
    return (
      <h6 
        id={headingId}
        className={cn("text-base font-semibold text-foreground mb-2 mt-3 first:mt-0 scroll-m-20", className)}
        {...props}
      >
        {children}
      </h6>
    );
  },
  p: ({ children, className, ...props }) => (
    <p 
      className={cn("leading-7 [&:not(:first-child)]:mt-6 text-foreground", className)}
      {...props}
    >
      {children}
    </p>
  ),
  a: ({ href, children, className, ...props }) => {
    const isExternal = href?.startsWith('http');
    
    return (
      <a
        href={href}
        className={cn(
          "font-medium text-accent underline underline-offset-4 hover:text-accent/80 transition-colors",
          className
        )}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },  code
: ({ children, className, ...props }) => {
    // Check if this is inside a pre tag (code block) or standalone (inline code)
    const isInlineCode = !className?.includes('language-');
    
    if (isInlineCode) {
      return <InlineCode className={className} {...props}>{children}</InlineCode>;
    }
    
    // For code blocks, return the code element with syntax highlighting classes
    return (
      <code
        className={cn("hljs", className)}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, className, ...props }) => {
    // Always use ServerCodeBlock for better syntax highlighting
    // Extract language from children if available
    let language = null;
    
    // Check if children has language class
    if (React.isValidElement(children) && children.props?.className) {
      const match = children.props.className.match(/language-(\w+)/);
      language = match?.[1];
    } else if (typeof children === 'object' && children !== null && 'props' in children && children.props?.className) {
      const match = children.props.className.match(/language-(\w+)/);
      language = match?.[1];
    }
    
    // If we have a language, use ServerCodeBlock
    if (language) {
      return (
        <ServerCodeBlock 
          className={className} 
          data-language={language}
          {...props}
        >
          {children}
        </ServerCodeBlock>
      );
    }
    
    // Fallback for pre without language - still use ServerCodeBlock for consistency
    return (
      <ServerCodeBlock 
        className={className}
        {...props}
      >
        {children}
      </ServerCodeBlock>
    );
  },
  blockquote: ({ children, className, ...props }) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-accent pl-6 italic text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children, className, ...props }) => (
    <ul
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }) => (
    <ol
      className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => (
    <li
      className={cn("text-foreground", className)}
      {...props}
    >
      {children}
    </li>
  ),
  hr: ({ className, ...props }) => (
    <hr
      className={cn("my-8 border-border", className)}
      {...props}
    />
  ),
  table: ({ children, className, ...props }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table
        className={cn(
          "w-full border-collapse border border-border",
          "!border-collapse !border !border-border",
          className
        )}
        style={{ borderCollapse: 'collapse' }}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }) => (
    <thead
      className={cn("!bg-muted", className)}
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({ children, className, ...props }) => (
    <tbody
      className={cn("!bg-transparent", className)}
      {...props}
    >
      {children}
    </tbody>
  ),
  tr: ({ children, className, ...props }) => (
    <tr
      className={cn(
        "border-b border-border",
        "!border-b !border-border",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, className, ...props }) => (
    <th
      className={cn(
        "border border-border px-4 py-2 text-left font-semibold text-foreground",
        "!border !border-border !px-4 !py-2 !text-left !font-semibold !text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, className, ...props }) => (
    <td
      className={cn(
        "border border-border px-4 py-2 text-foreground",
        "!border !border-border !px-4 !py-2 !text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </td>
  ),
  // Server-safe MDX Components without error boundaries
  Callout,
  ImageWithCaption,
  EnhancedTable,
};