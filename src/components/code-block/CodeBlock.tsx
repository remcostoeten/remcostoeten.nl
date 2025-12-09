'use client';

import { Copy, Search, X, ArrowUp, ArrowDown, ChevronDown, Check, CheckCircle2, File as FileIcon } from "lucide-react";
import { getLanguageIcon } from "./language-icons";
import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import React from "react";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { clsx, type ClassValue } from "clsx";
import type { CSSProperties } from "react";

// ============================================================================
// UTILITIES
// ============================================================================

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


// ============================================================================
// THEME CONFIGURATION
// ============================================================================

type TCustomTheme = { [key: string]: CSSProperties };

const customTheme: TCustomTheme = {
  'code[class*="language-"]': {
    color: "#d4d4d8",
    background: "none",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    fontSize: "14px",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#d4d4d8",
    background: "none",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    fontSize: "14px",
    tabSize: 2,
    hyphens: "none",
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto",
  },
  comment: { color: "#71717a", fontStyle: "italic" },
  "block-comment": { color: "#71717a", fontStyle: "italic" },
  prolog: { color: "#71717a" },
  doctype: { color: "#71717a" },
  cdata: { color: "#71717a" },
  punctuation: { color: "#a1a1aa" },
  operator: { color: "#a1a1aa" },
  url: { color: "#a1a1aa" },
  tag: { color: "#d4d4d8" },
  "attr-name": { color: "#d4d4d8" },
  namespace: { color: "#d4d4d8" },
  property: { color: "#d4d4d8" },
  symbol: { color: "#d4d4d8" },
  important: { color: "#d4d4d8", fontWeight: "bold" },
  atrule: { color: "#d4d4d8" },
  keyword: { color: "#d4d4d8" },
  regex: { color: "#d4d4d8" },
  entity: { color: "#d4d4d8", cursor: "help" },
  "function-name": { color: "#d4d4d8" },
  function: { color: "#d4d4d8" },
  "class-name": { color: "#d4d4d8" },
  builtin: { color: "#d4d4d8" },
  boolean: { color: "#d4d4d8" },
  number: { color: "#d4d4d8" },
  constant: { color: "#d4d4d8" },
  string: { color: "#a8a29e" },
  char: { color: "#a8a29e" },
  "attr-value": { color: "#a8a29e" },
  selector: { color: "#a8a29e" },
  deleted: { color: "#ef4444" },
  inserted: { color: "#34d399" },
  variable: { color: "#d4d4d8" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

// ============================================================================
// CSS ANIMATIONS (moved to global.css)
// ============================================================================

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

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

// ============================================================================
// TYPES
// ============================================================================

export type TCodeBlockProps = {
  code: string;
  language: string;
  fileName?: string;
  showLineNumbers?: boolean;
  showMetaInfo?: boolean;
  maxHeight?: string;
  className?: string;
  onCopy?: (code: string) => void;
  showIcon?: boolean;
  showBottomFade?: boolean;
  disableSearch?: boolean;
  disableCopy?: boolean;
  disableTopBar?: boolean;
};

// ============================================================================
// ICON COMPONENT
// ============================================================================

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CodeBlock({
  code,
  language,
  fileName,
  showLineNumbers = true,
  showMetaInfo = true,
  maxHeight = "400px",
  className,
  onCopy,
  showIcon = true,
  showBottomFade = true,
  disableSearch = false,
  disableCopy = false,
  disableTopBar = false,
}: TCodeBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const [showSearchAnimation, setShowSearchAnimation] = useState(false);
  const [showContentAnimation, setShowContentAnimation] = useState(true);
  const [showToastAnimation, setShowToastAnimation] = useState(false);

  const codeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => calculateCodeStats(code), [code]);

  const scrollToLine = useCallback((lineNumber: number) => {
    const lineElement = codeRef.current?.querySelector(`[data-line-number="${lineNumber}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query) {
        setSearchResults([]);
        setCurrentResultIndex(-1);
        setHighlightedLines([]);
        return;
      }

      const lines = code.split("\n");
      const matches = lines.reduce((acc, line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          acc.push(index + 1);
        }
        return acc;
      }, [] as number[]);

      setSearchResults(matches);
      setCurrentResultIndex(matches.length > 0 ? 0 : -1);
      setHighlightedLines(matches);

      if (matches.length > 0) {
        scrollToLine(matches[0]);
      }
    },
    [code, scrollToLine],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

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

  const goToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    scrollToLine(searchResults[nextIndex]);
  }, [searchResults, currentResultIndex, scrollToLine]);

  const goToPreviousResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIndex = currentResultIndex - 1 < 0 ? searchResults.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    scrollToLine(searchResults[prevIndex]);
  }, [searchResults, currentResultIndex, scrollToLine]);

  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && !disableCopy && !disableTopBar) {
        copyToClipboard();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !isCollapsed && !disableSearch && !disableTopBar) {
        e.preventDefault();
        setIsSearching(true);
      }

      if (isSearching && searchResults.length > 0) {
        if (e.key === "Enter") {
          if (e.shiftKey) {
            goToPreviousResult();
          } else {
            goToNextResult();
          }
        }
      }

      if (e.key === "Escape") {
        setHighlightedLines([]);
        setIsSearching(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [
    isCollapsed,
    isSearching,
    searchResults,
    currentResultIndex,
    copyToClipboard,
    goToNextResult,
    goToPreviousResult,
    disableSearch,
    disableCopy,
    disableTopBar,
  ]);

  // Manage search animation state
  useEffect(() => {
    if (isSearching !== showSearchAnimation) {
      const timer = setTimeout(() => setShowSearchAnimation(isSearching), 10);
      return () => clearTimeout(timer);
    }
  }, [isSearching, showSearchAnimation]);

  // Manage content animation state
  useEffect(() => {
    if (!isCollapsed !== showContentAnimation) {
      const timer = setTimeout(() => setShowContentAnimation(!isCollapsed), 10);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed, showContentAnimation]);

  // Manage toast animation state
  useEffect(() => {
    if (isCopied !== showToastAnimation) {
      setShowToastAnimation(isCopied);
      if (isCopied) {
        const timer = setTimeout(() => setShowToastAnimation(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isCopied, showToastAnimation]);

  function renderSearchUI() {
    return (
      <>
        {!disableSearch && showSearchAnimation && (
          <div
            className={cn(
              "flex-none flex items-center gap-2 bg-[#111111] rounded-lg border border-[#333333] p-1 h-8",
              showSearchAnimation && "codeblock-search-toggle"
            )}
            role="search"
            aria-label="Code search"
            style={{ overflow: 'hidden', willChange: 'max-width' }}
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-40 px-2 py-1 text-sm bg-transparent text-zinc-300 focus:outline-none placeholder:text-zinc-600"
                autoFocus
              />
              {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                  {searchResults.length > 0 ? (
                    <span>{currentResultIndex + 1}/{searchResults.length}</span>
                  ) : (
                    <span>No results</span>
                  )}
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <>
                <div className="h-4 w-[1px] bg-[#333333]" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousResult}
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextResult}
                    className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                  >
                    <ArrowDown size={14} />
                  </Button>
                </div>
              </>
            )}

            <div className="h-4 w-[1px] bg-[#333333]" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
                setSearchResults([]);
                setHighlightedLines([]);
              }}
              className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative my-8", className)}>
      <div
        className="group relative rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#333333] w-full transition-all duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!disableTopBar && (
          <header className="flex justify-between items-center px-4 py-2.5 bg-[#0A0A0A] border-b border-[#333333]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {showIcon && (
                <span className="flex items-center justify-center shrink-0 text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
                  <SimpleIcon language={language} />
                </span>
              )}
              {fileName && (
                <div className="shrink-0 flex items-center gap-2 rounded-full px-3 py-1 border bg-[#111111] border-[#333333] group-hover:border-[#444444]">
                  <FileIcon size={12} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">
                    {fileName}
                  </span>
                </div>
              )}

              {showMetaInfo && (
                <span className="shrink-0 px-2 py-0.5 text-xs font-medium text-zinc-500">
                  {stats.lines} lines
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 h-8">
              <div className="w-8 h-8 flex items-center justify-center">
                {!disableSearch && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearching(true)}
                    className={cn(
                      "relative h-8 w-8 text-zinc-500 hover:text-zinc-200 rounded-md transition-all duration-200 hover:bg-white/10",
                      isSearching && "invisible pointer-events-none"
                    )}
                    title="Search (⌘/Ctrl + F)"
                  >
                    <Search size={16} />
                  </Button>
                )}
              </div>

              {renderSearchUI()}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="relative h-8 w-8 text-zinc-500 hover:text-zinc-200 rounded-md transition-all duration-200 hover:bg-white/10"
              >
                <div className={cn(isCollapsed && "codeblock-chevron-rotate")}>
                  <ChevronDown size={16} />
                </div>
              </Button>

              {!disableCopy && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="relative h-8 w-8 text-zinc-500 hover:text-zinc-200 rounded-md transition-all duration-200 hover:bg-white/10"
                  title="Copy code (⌘/Ctrl + C)"
                >
                  {isCopied ? (
                    <div className={cn("text-emerald-400", "codeblock-copy-success")}>
                      <Check size={16} />
                    </div>
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              )}
            </div>
          </header>
        )}

        <>
          {showContentAnimation && (
            <div
              className={cn(
                "overflow-hidden",
                showContentAnimation && "codeblock-expand"
              )}
            >
              <div className="relative" ref={codeRef}>
                {showLineNumbers && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3.5rem] bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent pointer-events-none z-10" />
                )}

                <div className="relative">
                  <div
                    className="pt-4 px-4 overflow-y-auto"
                    style={{ maxHeight }}
                  >
                    {React.createElement(SyntaxHighlighter as any, {
                      language: language.toLowerCase(),
                      style: customTheme,
                      customStyle: {
                        margin: 0,
                        padding: 0,
                        background: "transparent",
                        fontSize: "0.875rem",
                      },
                      showLineNumbers: showLineNumbers,
                      lineNumberStyle: {
                        color: "#666666",
                        minWidth: "2.5em",
                        paddingRight: "1em",
                        textAlign: "right",
                        userSelect: "none",
                        opacity: isHovered ? 1 : 0.5,
                        transition: "opacity 0.2s ease",
                      },
                      wrapLines: true,
                      wrapLongLines: true,
                      lineProps: (lineNumber) => ({
                        style: {
                          display: "block",
                          backgroundColor: highlightedLines.includes(lineNumber)
                            ? "rgba(212, 212, 216, 0.15)"
                            : searchResults.includes(lineNumber)
                            ? "rgba(212, 212, 216, 0.1)"
                            : "transparent",
                        },
                        "data-line-number": lineNumber,
                      }),
                      children: code
                    })}
                  </div>
                  {showBottomFade && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      </div>

      <>
        {showToastAnimation && (
          <div
            className={cn(
              "absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] shadow-lg",
              showToastAnimation && "codeblock-toast"
            )}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">Copied to clipboard</span>
          </div>
        )}
      </>
    </div>
  );
}

export default CodeBlock;
