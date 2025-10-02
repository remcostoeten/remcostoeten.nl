'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import php from 'highlight.js/lib/languages/php';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import ruby from 'highlight.js/lib/languages/ruby';
import csharp from 'highlight.js/lib/languages/csharp';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('php', php);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('c#', csharp);

const languageAliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'c++': 'cpp',
    'c': 'cpp',
    'htm': 'html',
    'sh': 'bash',
    'shell': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'c#': 'csharp',
    'cs': 'csharp',
};

type Props = {
    children: React.ReactNode;
    className?: string;
    'data-language'?: string;
    filename?: string;
    showLineNumbers?: boolean;
    highlightLines?: number[];
    theme?: 'github-light' | 'github-dark';
}

export function CodeBlock({
    children,
    className,
    'data-language': language,
    filename,
    showLineNumbers = false,
    highlightLines = [],
    theme,
    ...props
}: Props) {
    const [copied, setCopied] = useState<boolean | 'error'>(false);
    const codeRef = useRef<HTMLElement>(null);
    const detectedTheme = useTheme();

    const activeTheme = theme || (detectedTheme === 'dark' ? 'github-dark' : 'github-light');

    const getCodeContent = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(getCodeContent).join('');
        if (
            node &&
            typeof node === 'object' &&
            'props' in node &&
            node.props &&
            typeof node.props === 'object' &&
            'children' in node.props
        ) {
            return getCodeContent((node as { props: { children: React.ReactNode } }).props.children);
        }
        return '';
    };

    async function handleCopy() {
        const code = getCodeContent(children);

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            }

            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                throw new Error('execCommand copy failed');
            }
        } catch (err) {
            console.error('Failed to copy code:', err);

            // Show user-friendly error feedback
            setCopied('error');
            setTimeout(() => setCopied(false), 3000);
        }
    };

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCopy();
        }
    };

    const rawLanguage = language || className?.match(/language-(\w+)/)?.[1];
    const normalizedLanguage = rawLanguage ? (languageAliases[rawLanguage.toLowerCase()] || rawLanguage.toLowerCase()) : null;
    const displayLanguage = rawLanguage || 'code';

    const clipboardSupported = typeof navigator !== 'undefined' &&
        (navigator.clipboard || document.execCommand);

    useEffect(() => {
        if (codeRef.current && normalizedLanguage) {
            const code = getCodeContent(children);

            try {
                if (hljs.getLanguage(normalizedLanguage)) {
                    const result = hljs.highlight(code, { language: normalizedLanguage });
                    codeRef.current.innerHTML = result.value;
                } else {
                    const result = hljs.highlightAuto(code);
                    codeRef.current.innerHTML = result.value;
                }
            } catch (error) {
                console.warn('Syntax highlighting failed:', error);
                codeRef.current.textContent = code;
            }
        }
    }, [children, normalizedLanguage]);

    const codeContent = getCodeContent(children);
    const lines = codeContent.split('\n');
    const shouldShowLineNumbers = showLineNumbers && lines.length > 1;

    const handleContainerKeyDown = (event: React.KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            event.preventDefault();
            handleCopy();
        }
    };

    return (
        <div
            className="relative group"
            onKeyDown={handleContainerKeyDown}
            tabIndex={0}
            role="region"
            aria-label={`Code block in ${displayLanguage}`}
        >
            {/* Header with language label, filename, and copy button */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b  border-border rounded-t-lg">
                <div className="flex items-center gap-2">
                    {filename && (
                        <span className="text-xs font-medium text-foreground">
                            {filename}
                        </span>
                    )}
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {displayLanguage}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "flex items-center gap-1 px-2 py-1 text-xs transition-colors rounded opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                        copied === 'error'
                            ? "text-destructive hover:text-destructive/80"
                            : copied
                                ? "text-green-600 hover:text-green-700"
                                : "text-muted-foreground hover:text-foreground"
                    )}
                    title={
                        copied === 'error'
                            ? 'Failed to copy code'
                            : !clipboardSupported
                                ? 'Copy not supported in this browser'
                                : 'Copy code'
                    }
                    aria-label={
                        copied === 'error'
                            ? 'Failed to copy code to clipboard'
                            : !clipboardSupported
                                ? 'Copy not supported in this browser'
                                : 'Copy code to clipboard'
                    }
                    disabled={copied === 'error' || !clipboardSupported}
                >
                    {copied === 'error' ? (
                        <>
                            <AlertCircle className="w-3 h-3" />
                            Failed
                        </>
                    ) : copied ? (
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
            <div className="relative  !hidden">
                <pre
                    className={cn(
                        "overflow-x-auto rounded-b-lg bg-muted text-sm leading-relaxed",
                        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
                        "!bg-muted !m-0 !rounded-b-lg",
                        shouldShowLineNumbers ? "pl-0" : "p-4",
                        className
                    )}
                    {...props}
                >
                    <div className={cn("flex", shouldShowLineNumbers && "min-h-full")}>
                        {/* Line numbers */}
                        {shouldShowLineNumbers && (
                            <div className="flex-shrink-0 px-4 py-4 text-muted-foreground text-right border-r border-border bg-muted/30 select-none">
                                {lines.map((_, index) => {
                                    const lineNumber = index + 1;
                                    const isHighlighted = highlightLines.includes(lineNumber);
                                    return (
                                        <div
                                            key={lineNumber}
                                            className={cn(
                                                "leading-relaxed",
                                                isHighlighted && "bg-accent/20 -mx-2 px-2"
                                            )}
                                        >
                                            {lineNumber}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Code content */}
                        <code
                            ref={codeRef}
                            className={cn(
                                "hljs block flex-1 p-4",
                                `hljs-${activeTheme}`,
                                !shouldShowLineNumbers && highlightLines.length > 0 && "relative"
                            )}
                            style={{
                                background: 'transparent',
                                padding: shouldShowLineNumbers ? '1rem' : '1rem',
                            }}
                        >
                            {!normalizedLanguage && getCodeContent(children)}
                        </code>
                    </div>

                    {/* Line highlighting overlay for non-line-numbered code */}
                    {!shouldShowLineNumbers && highlightLines.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                            {lines.map((_, index) => {
                                const lineNumber = index + 1;
                                const isHighlighted = highlightLines.includes(lineNumber);
                                if (!isHighlighted) return null;

                                return (
                                    <div
                                        key={lineNumber}
                                        className="bg-accent/10 border-l-2 border-accent"
                                        style={{
                                            position: 'absolute',
                                            top: `${index * 1.5}rem`,
                                            left: 0,
                                            right: 0,
                                            height: '1.5rem',
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </pre>
            </div>
        </div>
    );
}

type TProps = {
    children: React.ReactNode;
    className?: string;
}

export function InlineCode({ children, className, ...props }: TProps) {
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