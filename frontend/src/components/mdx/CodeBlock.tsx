'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  'data-language'?: string;
}

export function CodeBlock({ children, className, 'data-language': language, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract the code content for copying
  const getCodeContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getCodeContent).join('');
    if (node && typeof node === 'object' && 'props' in node) {
      return getCodeContent(node.props.children);
    }
    return '';
  };

  const handleCopy = async () => {
    const code = getCodeContent(children);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const detectedLanguage = language || className?.match(/language-(\w+)/)?.[1];

  return (
    <div className="relative group">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {detectedLanguage || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded opacity-0 group-hover:opacity-100"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre
        className={cn(
          "overflow-x-auto rounded-b-lg bg-muted p-4 text-sm leading-relaxed",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
          "!bg-muted !p-4 !m-0 !rounded-b-lg",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className, ...props }: InlineCodeProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}