'use client';

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  File,
  Search,
  X,
} from "lucide-react";
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
    color: "#f1f5f9",
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
    color: "#f1f5f9",
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
  comment: { color: "#636e7b", fontStyle: "italic" },
  "block-comment": { color: "#636e7b", fontStyle: "italic" },
  prolog: { color: "#636e7b" },
  doctype: { color: "#636e7b" },
  cdata: { color: "#636e7b" },
  punctuation: { color: "#94a3b8" },
  operator: { color: "#94a3b8" },
  url: { color: "#94a3b8" },
  tag: { color: "#f472b6" },
  "attr-name": { color: "#f472b6" },
  namespace: { color: "#f472b6" },
  property: { color: "#f472b6" },
  symbol: { color: "#f472b6" },
  important: { color: "#f472b6", fontWeight: "bold" },
  atrule: { color: "#f472b6" },
  keyword: { color: "#f472b6" },
  regex: { color: "#f472b6" },
  entity: { color: "#f472b6", cursor: "help" },
  "function-name": { color: "#60a5fa" },
  function: { color: "#60a5fa" },
  "class-name": { color: "#93c5fd" },
  builtin: { color: "#93c5fd" },
  boolean: { color: "#c084fc" },
  number: { color: "#c084fc" },
  constant: { color: "#c084fc" },
  string: { color: "#a5b4fc" },
  char: { color: "#a5b4fc" },
  "attr-value": { color: "#a5b4fc" },
  selector: { color: "#a5b4fc" },
  deleted: { color: "#ef4444" },
  inserted: { color: "#34d399" },
  variable: { color: "#f1f5f9" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

// ============================================================================
// ANIMATIONS
// ============================================================================

const ANIMATIONS = {
  collapse: {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      },
    },
  },
  copy: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  },
  toast: {
    hidden: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
  searchToggle: {
    hidden: { maxWidth: 0, transition: { duration: 0.1, ease: [0.2, 0.9, 0.3, 1] } },
    visible: { maxWidth: 320, transition: { duration: 0.1, ease: [0.2, 0.9, 0.3, 1] } },
  },
} as const;

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

  function renderSearchUI() {
    return (
      <AnimatePresence initial={false} mode="popLayout">
        {!disableSearch && isSearching && (
          <motion.div
            key="code-search-ui"
            variants={ANIMATIONS.searchToggle}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="search"
            aria-label="Code search"
            style={{ overflow: 'hidden', willChange: 'max-width' }}
            className="flex-none flex items-center gap-2 bg-[#111111] rounded-lg border border-[#333333] p-1 h-8"
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
          </motion.div>
        )}
      </AnimatePresence>
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
                  <File size={12} className="text-zinc-400" />
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

            <motion.div className="flex items-center space-x-1.5 h-8">
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
                <motion.div
                  initial={false}
                  animate={{ rotate: isCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </Button>

              {!disableCopy && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="relative h-8 w-8 text-zinc-500 hover:text-zinc-200 rounded-md transition-all duration-200 hover:bg-white/10"
                  title="Copy code (⌘/Ctrl + C)"
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        variants={ANIMATIONS.copy}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-emerald-400"
                      >
                        <Check size={16} />
                      </motion.div>
                    ) : (
                      <Copy size={16} />
                    )}
                  </AnimatePresence>
                </Button>
              )}
            </motion.div>
          </header>
        )}

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={ANIMATIONS.collapse}
              className="overflow-hidden"
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
                            ? "rgba(59, 130, 246, 0.15)"
                            : searchResults.includes(lineNumber)
                            ? "rgba(59, 130, 246, 0.1)"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isCopied && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={ANIMATIONS.toast}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">Copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CodeBlock;
