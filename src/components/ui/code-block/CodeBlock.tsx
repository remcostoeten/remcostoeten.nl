'use client';

import { Copy, Search, X, ArrowUp, ArrowDown, ChevronDown, Check, CheckCircle2, File as FileIcon } from "lucide-react";
import { getLanguageIcon } from "./language-icons";
import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import React from "react";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { clsx, type ClassValue } from "clsx";
import type { CSSProperties } from "react";


export const cn = (...inputs: ClassValue[]) => {
  const classes = clsx(inputs).split(' ');
  const merged = new Map<string, string>();

  for (const cls of classes) {
    if (!cls) continue;
    const baseClass = cls.replace(/^(sm|md|lg|xl|2xl|hover|focus|active|disabled):/, '');
    const prefix = cls.match(/^(sm|md|lg|xl|2xl|hover|focus|active|disabled):/)?.[1] || '';
    const key = prefix ? `${prefix}:${baseClass.split('-')[0]}` : baseClass.split('-')[0];
    merged.set(key, cls);
  }

  return Array.from(merged.values()).join(' ');
};

const calculateCodeStats = (code: string) => {
  const lines = code.split("\n").length;
  const chars = code.length;
  const words = code.trim().split(/\s+/).length;
  return { lines, chars, words };
};



type TCustomTheme = { [key: string]: CSSProperties };

const customTheme: TCustomTheme = {
  'code[class*="language-"]': {
    color: "#e2e2e2",
    background: "none",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.7",
    fontSize: "13px",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#e2e2e2",
    background: "none",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.7",
    fontSize: "13px",
    tabSize: 2,
    hyphens: "none",
    padding: "1.25rem",
    margin: "0",
    overflow: "auto",
  },
  comment: { color: "#666666", fontStyle: "italic" },
  "block-comment": { color: "#666666", fontStyle: "italic" },
  prolog: { color: "#666666" },
  doctype: { color: "#666666" },
  cdata: { color: "#666666" },
  punctuation: { color: "#999999" },
  operator: { color: "#999999" },
  url: { color: "#999999" },
  tag: { color: "#ff7b72" },
  "attr-name": { color: "#ffa657" },
  namespace: { color: "#ffa657" },
  property: { color: "#79c0ff" },
  symbol: { color: "#79c0ff" },
  important: { color: "#d2a8ff", fontWeight: "bold" },
  atrule: { color: "#d2a8ff" },
  keyword: { color: "#ff7b72" },
  regex: { color: "#a5d6ff" },
  entity: { color: "#79c0ff", cursor: "help" },
  "function-name": { color: "#d2a8ff" },
  function: { color: "#d2a8ff" },
  "class-name": { color: "#ffa657" },
  builtin: { color: "#ffa657" },
  boolean: { color: "#79c0ff" },
  number: { color: "#79c0ff" },
  constant: { color: "#79c0ff" },
  string: { color: "#a5d6ff" },
  char: { color: "#a5d6ff" },
  "attr-value": { color: "#a5d6ff" },
  selector: { color: "#7ee787" },
  deleted: { color: "#ffa198" },
  inserted: { color: "#7ee787" },
  variable: { color: "#ffa657" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};



type TButtonVariant = "default" | "ghost";
type TButtonSize = "default" | "sm" | "icon";

interface TButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
}

const getButtonClasses = (variant: TButtonVariant = "default", size: TButtonSize = "default") => {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    icon: "h-9 w-9",
  };

  return cn(base, variants[variant], sizes[size]);
};

const Button = memo(function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: TButtonProps) {
  return (
    <button
      className={cn(getButtonClasses(variant, size), className)}
      {...props}
    />
  );
});


export type TCodeBlockProps = {
  code: string;
  language: string;
  fileName?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
  className?: string;
  onCopy?: (code: string) => void;
  showIcon?: boolean;
  disableCopy?: boolean;
  disableTopBar?: boolean;
};


const DEFAULT_ICON_SIZE = 16;

function SimpleIcon({
  language,
  className = "",
  size = DEFAULT_ICON_SIZE
}: { language: string; className?: string; size?: number }) {
  const IconComponent = getLanguageIcon(language);

  return (
    <IconComponent
      size={size}
      className={cn("flex-shrink-0", className)}
    />
  );
}


export function CodeBlock({
  code,
  language,
  fileName,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight,
  className,
  onCopy,
  showIcon = true,
  disableCopy = false,
  disableTopBar = false,
}: TCodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.(code);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [code, onCopy]);

  return (
    <div className={cn("relative my-8 group/code", className)}>
      <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/60 transition-colors duration-300 hover:border-neutral-700/80">
        {!disableTopBar && (
          <header className="flex justify-between items-center px-4 py-2.5 bg-neutral-900/50 border-b border-neutral-800/60">
            <div className="flex items-center gap-3 min-w-0">
              {showIcon && (
                <span className="text-neutral-500">
                  <SimpleIcon language={language} size={14} />
                </span>
              )}
              {fileName && (
                <span className="text-[12px] font-medium text-neutral-400 truncate">
                  {fileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                {language}
              </span>
              {!disableCopy && (
                <button
                  onClick={copyToClipboard}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                  title="Copy code"
                >
                  {isCopied ? (
                    <Check size={14} className="text-lime-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
          </header>
        )}

        <div
          className="relative overflow-x-auto"
          style={{ maxHeight: maxHeight || 'none' }}
          ref={codeRef}
        >
          <div className="py-4">
            {React.createElement(SyntaxHighlighter as any, {
              language: language.toLowerCase(),
              style: customTheme,
              customStyle: {
                margin: 0,
                padding: 0,
                background: "transparent",
                fontSize: "0.8125rem",
                lineHeight: "1.7",
              },
              showLineNumbers: showLineNumbers,
              lineNumberStyle: {
                color: "#444444",
                minWidth: "3em",
                paddingRight: "1.5rem",
                textAlign: "right",
                userSelect: "none",
                fontSize: "0.75rem",
              },
              wrapLines: true,
              wrapLongLines: false,
              lineProps: (lineNumber) => ({
                style: {
                  display: "block",
                  backgroundColor: highlightLines.includes(lineNumber)
                    ? "rgba(163, 230, 53, 0.05)"
                    : "transparent",
                  borderLeft: highlightLines.includes(lineNumber)
                    ? "2px solid #a3e635"
                    : "2px solid transparent",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                },
              }),
              children: code.trim()
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeBlock;
