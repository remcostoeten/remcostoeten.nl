'use client';

import { Check, Copy, Search, ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { codeToHtml } from "shiki";
import { cn } from "../code-block";

type ShikiCodeBlockProps = {
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
    className?: string;
};

export function ShikiCodeBlock({
    code,
    language = "typescript",
    filename,
    showLineNumbers = true,
    className,
}: ShikiCodeBlockProps) {
    const [html, setHtml] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Highlight code on mount and when code/language changes
    useEffect(() => {
        let mounted = true;

        async function highlight() {
            try {
                setIsLoading(true);

                const highlightedHtml = await codeToHtml(code, {
                    lang: language,
                    theme: 'one-dark-pro',
                });

                if (mounted) {
                    setHtml(highlightedHtml);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Shiki highlighting error:', error);
                if (mounted) {
                    // Fallback to plain code
                    setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`);
                    setIsLoading(false);
                }
            }
        }

        highlight();
        return () => { mounted = false; };
    }, [code, language]);

    // Escape HTML for fallback
    function escapeHtml(text: string) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Copy to clipboard
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    // Add line numbers to the HTML
    const addLineNumbers = useCallback((htmlContent: string) => {
        if (!showLineNumbers) return htmlContent;

        const lines = code.split('\n');
        const lineNumbersHtml = lines.map((_, i) =>
            `<span class="line-number">${i + 1}</span>`
        ).join('');

        // Wrap with line numbers container
        return `
      <div class="code-with-lines">
        <div class="line-numbers">${lineNumbersHtml}</div>
        <div class="code-content">${htmlContent}</div>
      </div>
    `;
    }, [code, showLineNumbers]);

    const stats = useMemo(() => {
        const lines = code.split('\n').length;
        const words = code.trim().split(/\s+/).length;
        return { lines, words };
    }, [code]);

    return (
        <div className={cn(
            "shiki-code-block rounded-lg border border-[#222] bg-[#09090b] overflow-hidden my-6",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#09090b] border-b border-[#222]">
                <div className="flex items-center gap-3">
                    {filename && (
                        <>
                            <span className="text-sm text-[#cccccc] font-medium">{filename}</span>
                            <span className="text-xs text-[#6e7681]">
                                {stats.lines} lines • {stats.words} words
                            </span>
                        </>
                    )}
                    {!filename && (
                        <span className="text-xs text-[#6e7681] uppercase">{language}</span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { }}
                        className="p-1.5 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
                        title="Search"
                    >
                        <Search size={14} />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        <ChevronDown
                            size={14}
                            className={cn("transition-transform", isCollapsed && "rotate-180")}
                        />
                    </button>
                </div>
            </div>

            {/* Code Content */}
            {!isCollapsed && (
                <div className="overflow-auto max-h-[500px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 text-[#6e7681]">
                            Loading...
                        </div>
                    ) : (
                        <div
                            className="shiki-content p-4"
                            dangerouslySetInnerHTML={{ __html: addLineNumbers(html) }}
                        />
                    )}
                </div>
            )}

            <style jsx global>{`
        .shiki-code-block .shiki {
          background: transparent !important;
          margin: 0;
          padding: 0;
        }
        
        .shiki-code-block pre {
          background: transparent !important;
          margin: 0;
          padding: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .shiki-code-block code {
          background: transparent !important;
          font-family: inherit;
        }
        
        .shiki-code-block .code-with-lines {
          display: flex;
        }
        
        .shiki-code-block .line-numbers {
          display: flex;
          flex-direction: column;
          padding-right: 16px;
          margin-right: 16px;
          border-right: 1px solid #2d2d2d;
          text-align: right;
          color: #6e7681;
          font-size: 14px;
          line-height: 1.6;
          user-select: none;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        
        .shiki-code-block .line-number {
          display: block;
        }
        
        .shiki-code-block .code-content {
          flex: 1;
          overflow-x: auto;
        }
        
        .shiki-code-block .code-content pre {
          display: inline-block;
          min-width: 100%;
        }
      `}</style>
        </div>
    );
}

export default ShikiCodeBlock;
