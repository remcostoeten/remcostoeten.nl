import React from 'react';
import { cn } from '@/lib/utils';
import hljs from 'highlight.js/lib/core';

// Import commonly used languages for server-side highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml'; // for HTML
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);

interface ServerCodeBlockProps {
  children: React.ReactNode;
  className?: string;
  'data-language'?: string;
}

function getCodeContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (React.isValidElement(children) && children.props?.children) {
    return getCodeContent(children.props.children);
  }
  
  if (Array.isArray(children)) {
    return children.map(child => getCodeContent(child)).join('');
  }
  
  return String(children || '');
}

function normalizeLanguage(lang: string): string {
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
    'py': 'python',
    'md': 'markdown',
  };
  
  return langMap[lang.toLowerCase()] || lang.toLowerCase();
}

export function ServerCodeBlock({ children, className, 'data-language': dataLanguage, ...props }: ServerCodeBlockProps) {
  // Extract language from className or data-language
  const classLanguage = className?.match(/language-(\w+)/)?.[1];
  const rawLanguage = dataLanguage || classLanguage;
  const normalizedLanguage = rawLanguage ? normalizeLanguage(rawLanguage) : null;
  const displayLanguage = rawLanguage || 'code';

  // Get the code content
  const codeContent = getCodeContent(children);
  
  // Apply syntax highlighting on the server
  let highlightedCode = codeContent;
  
  if (normalizedLanguage) {
    try {
      if (hljs.getLanguage(normalizedLanguage)) {
        const result = hljs.highlight(codeContent, { language: normalizedLanguage });
        highlightedCode = result.value;
      } else {
        // Fallback to auto-detection
        const result = hljs.highlightAuto(codeContent);
        highlightedCode = result.value;
      }
    } catch (error) {
      console.warn('Server-side syntax highlighting failed:', error);
      highlightedCode = codeContent;
    }
  }

  return (
    <div className="relative group">
      {/* Header with language label */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {displayLanguage}
          </span>
        </div>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto p-4 bg-muted/30 rounded-b-lg border border-t-0 border-border",
            "text-sm font-mono leading-relaxed",
            className
          )}
          {...props}
        >
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}