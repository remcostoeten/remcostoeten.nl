import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';

// Export MDX components with proper styling
export const mdxComponents: MDXComponents = {
  h1: ({ children, className, ...props }) => (
    <h1 
      className={cn("text-4xl lg:text-5xl font-bold text-foreground mb-6 mt-8 first:mt-0 scroll-m-20", className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2 
      className={cn("text-3xl font-semibold text-foreground mb-4 mt-8 first:mt-0 scroll-m-20", className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3 
      className={cn("text-2xl font-semibold text-foreground mb-3 mt-6 first:mt-0 scroll-m-20", className)}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }) => (
    <h4 
      className={cn("text-xl font-semibold text-foreground mb-2 mt-4 first:mt-0 scroll-m-20", className)}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, className, ...props }) => (
    <h5 
      className={cn("text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0 scroll-m-20", className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, className, ...props }) => (
    <h6 
      className={cn("text-base font-semibold text-foreground mb-2 mt-3 first:mt-0 scroll-m-20", className)}
      {...props}
    >
      {children}
    </h6>
  ),
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
  },
  code: ({ children, className, ...props }) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, className, ...props }) => (
    <pre
      className={cn(
        "mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
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
};