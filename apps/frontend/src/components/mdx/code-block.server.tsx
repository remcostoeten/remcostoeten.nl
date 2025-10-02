'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import hljs from 'highlight.js/lib/core';
import { Copy } from 'lucide-react';

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
  'data-filename'?: string;
}

function getCodeContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }

  if (React.isValidElement(children) && (children as any).props?.children) {
    return getCodeContent((children as any).props.children);
  }

  if (Array.isArray(children)) {
    return children.map(child => getCodeContent(child)).join('');
  }

  return String(children || '');
}

function extractFilePathAndCode(content: string): { filePath: string | null; cleanCode: string } {
  // Look for file paths at the beginning of the code block
  // Patterns like: backend/src/api/schema/visitors.ts
  // Or: ./src/components/MyComponent.tsx
  // Or: /path/to/file.js
  const filePathRegex = /^([^\n]*\.(ts|tsx|js|jsx|py|css|scss|html|json|yaml|yml|md|sql|sh|bash|env|config|txt|xml))\s*\n/i;
  const match = content.match(filePathRegex);

  if (match) {
    const filePath = match[1].trim();
    const cleanCode = content.substring(match[0].length);
    return { filePath, cleanCode };
  }

  return { filePath: null, cleanCode: content };
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

export function ServerCodeBlock({ children, className, 'data-language': dataLanguage, 'data-filename': dataFilename, ...props }: ServerCodeBlockProps) {
  // Extract language from className or data-language
  const classLanguage = className?.match(/language-(\w+)/)?.[1];
  const rawLanguage = dataLanguage || classLanguage;
  const normalizedLanguage = rawLanguage ? normalizeLanguage(rawLanguage) : null;
  const displayLanguage = rawLanguage || 'code';

  // Get the code content and extract file path if present
  const rawCodeContent = getCodeContent(children);
  const { filePath: extractedFilePath, cleanCode } = extractFilePathAndCode(rawCodeContent);

  // Use provided filename or extracted file path
  const filePath = dataFilename || extractedFilePath;
  const codeContent = filePath ? cleanCode : rawCodeContent;

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
    <div className="my-4 relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span className="sm:hidden">
              {displayLanguage === 'typescript' ? 'TS' :
                displayLanguage === 'javascript' ? 'JS' :
                  displayLanguage === 'markdown' ? 'MD' :
                    displayLanguage === 'python' ? 'PY' :
                      displayLanguage === 'bash' ? 'SH' :
                        displayLanguage.length > 3 ? displayLanguage.substring(0, 3).toUpperCase() :
                          displayLanguage.toUpperCase()}
            </span>
            <span className="hidden sm:inline">{displayLanguage}</span>
          </span>
          {filePath && (
            <>
              <div className="w-px h-4 bg-border"></div>
              <span
                className="text-xs font-mono text-foreground bg-muted/60 px-2 py-1 rounded max-w-[200px] sm:max-w-[300px] truncate cursor-move select-none"
                title={filePath}
                draggable="true"
                onDragStart={(e) => {
                  if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', filePath);
                    e.dataTransfer.effectAllowed = 'copy';
                  }
                }}
              >
                <span className="sm:hidden">
                  {filePath.length > 20 ? `${filePath.substring(0, 18)}...` : filePath}
                </span>
                <span className="hidden sm:inline">{filePath}</span>
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(codeContent).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = codeContent;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                  document.execCommand('copy');
                } catch (err) {
                  console.error('Failed to copy code:', err);
                }
                document.body.removeChild(textArea);
              });
            }
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs transition-colors rounded opacity-70 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 text-muted-foreground hover:text-foreground"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          <Copy className="w-3 h-3" />
          <span className="hidden sm:inline">Copy</span>
        </button>
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