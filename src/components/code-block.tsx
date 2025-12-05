/**
 * Beautiful Code Block Component
 * 
 * A feature-rich, customizable code display component for React/Next.js applications
 * with syntax highlighting, search functionality, keyboard shortcuts, and custom badges.
 * 
 * Features:
 * • Syntax highlighting for 100+ languages
 * • Interactive search with Cmd/Ctrl+F
 * • Line highlighting and click callbacks
 * • Copy to clipboard with Cmd/Ctrl+C
 * • Collapsible code blocks with smooth animations
 * • Custom badge system with variants and auto-scroll
 * • Keyboard shortcuts and accessibility support
 * 
 * Installation:
 * 1. Install dependencies: framer-motion lucide-react react-syntax-highlighter clsx tailwind-merge @radix-ui/react-slot class-variance-authority
 * 2. Copy this file to your components directory
 * 3. Import and use: import { CodeBlock } from './beautiful-code-block'
 * 

 * @author Remco Stoeten
 * @name  Beautiful Code Block 
 * 
 * @description 
 * A feature-rich, performant, accessible code-block render component, which probably is the most beautiful you'll see.
 * 110+ languages, search highlight, programatic line highlighting, per-language icons, custom labels/themes, copy button, kbd-shortcuts
*/

'use client';

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

// Simple className merger - replaces twMerge with basic deduplication
export const cn = (...inputs: ClassValue[]) => {
  const classes = clsx(inputs).split(' ');
  const merged = new Map<string, string>();

  // Simple deduplication for common conflicting classes
  for (const cls of classes) {
    if (!cls) continue;

    // Handle responsive variants and state variants
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

// Detect light/dark mode based on Tailwind's `dark` class or system preference
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const update = () => {
      setIsDark(root.classList.contains('dark') || media.matches);
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    media.addEventListener('change', update);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
    };
  }, []);

  return isDark;
}

// ============================================================================
// OPTIMIZED THEME CONFIGURATION
// ============================================================================

type TCustomTheme = { [key: string]: CSSProperties };

// Dark theme - One Dark Pro inspired with colorful syntax highlighting
const customTheme: TCustomTheme = {
  'code[class*="language-"]': {
    color: "#abb2bf",
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
    color: "#abb2bf",
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
  comment: { color: "#5c6370", fontStyle: "italic" },
  "block-comment": { color: "#5c6370", fontStyle: "italic" },
  prolog: { color: "#5c6370" },
  doctype: { color: "#5c6370" },
  cdata: { color: "#5c6370" },
  punctuation: { color: "#abb2bf" },
  operator: { color: "#56b6c2" },
  url: { color: "#56b6c2" },
  tag: { color: "#e06c75" },
  "attr-name": { color: "#d19a66" },
  namespace: { color: "#e5c07b" },
  property: { color: "#e06c75" },
  symbol: { color: "#61afef" },
  important: { color: "#c678dd", fontWeight: "bold" },
  atrule: { color: "#c678dd" },
  keyword: { color: "#c678dd" },
  regex: { color: "#98c379" },
  entity: { color: "#61afef", cursor: "help" },
  "function-name": { color: "#61afef" },
  function: { color: "#61afef" },
  "class-name": { color: "#e5c07b" },
  builtin: { color: "#e5c07b" },
  boolean: { color: "#d19a66" },
  number: { color: "#d19a66" },
  constant: { color: "#d19a66" },
  string: { color: "#98c379" },
  char: { color: "#98c379" },
  "attr-value": { color: "#98c379" },
  selector: { color: "#e06c75" },
  deleted: { color: "#e06c75" },
  inserted: { color: "#98c379" },
  variable: { color: "#e06c75" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

// Light theme - GitHub Light inspired with colorful syntax highlighting
const customThemeLight: TCustomTheme = {
  'code[class*="language-"]': {
    color: "#24292f",
    background: "none",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    fontSize: "14px",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#24292f",
    background: "none",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    fontSize: "14px",
    tabSize: 2,
    hyphens: "none",
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto",
  },
  comment: { color: "#6e7781", fontStyle: "italic" },
  "block-comment": { color: "#6e7781", fontStyle: "italic" },
  prolog: { color: "#6e7781" },
  doctype: { color: "#6e7781" },
  cdata: { color: "#6e7781" },
  punctuation: { color: "#24292f" },
  operator: { color: "#0550ae" },
  url: { color: "#0550ae" },
  tag: { color: "#116329" },
  "attr-name": { color: "#0550ae" },
  namespace: { color: "#953800" },
  property: { color: "#0550ae" },
  symbol: { color: "#0550ae" },
  important: { color: "#8250df", fontWeight: "bold" },
  atrule: { color: "#8250df" },
  keyword: { color: "#cf222e" },
  regex: { color: "#0a3069" },
  entity: { color: "#0550ae", cursor: "help" },
  "function-name": { color: "#8250df" },
  function: { color: "#8250df" },
  "class-name": { color: "#953800" },
  builtin: { color: "#953800" },
  boolean: { color: "#0550ae" },
  number: { color: "#0550ae" },
  constant: { color: "#0550ae" },
  string: { color: "#0a3069" },
  char: { color: "#0a3069" },
  "attr-value": { color: "#0a3069" },
  selector: { color: "#116329" },
  deleted: { color: "#82071e" },
  inserted: { color: "#116329" },
  variable: { color: "#953800" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

// ============================================================================
// OPTIMIZED LANGUAGE ICONS
// ============================================================================

type TIconProps = {
  className?: string;
  size?: number;
};

const DEFAULT_ICON_SIZE = 16;

// Beautiful icon component for languages using react-icons
function SimpleIcon({
  language,
  className = "",
  size = DEFAULT_ICON_SIZE
}: TIconProps & { language: string }) {
  const IconComponent = getLanguageIcon(language);

  return (
    <IconComponent
      size={size}
      className={cn("flex-shrink-0", className)}
    />
  );
}

// ============================================================================
// CSS ANIMATIONS (moved to global.css)
// ============================================================================

// ============================================================================
// SIMPLIFIED BUTTON COMPONENT
// ============================================================================

type TButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type TButtonSize = "default" | "sm" | "lg" | "icon";

interface TButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
}

// Simple button class generator - replaces CVA
const getButtonClasses = (variant: TButtonVariant = "default", size: TButtonSize = "default") => {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
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

export type TBadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "custom";

export type TBadge = {
  text: string;
  variant: TBadgeVariant;
  customClass?: string;
};



export type TCodeBlockProps = {
  /** The source code to display */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Optional file name to display in header */
  fileName?: string;
  /** Array of badges to display in header */
  badges?: TBadge[];
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Enable interactive line highlighting (default: false) */
  enableLineHighlight?: boolean;
  /** Enable hover highlighting for lines (default: false) */
  enableLineHover?: boolean;
  /** Custom color for hover highlighting (default: 'rgba(255, 255, 255, 0.1)' for dark, 'rgba(0, 0, 0, 0.05)' for light) */
  hoverHighlightColor?: string;
  /** Show metadata like line count in header (default: true) */
  showMetaInfo?: boolean;
  /** Maximum height before scrolling (default: "400px") */
  maxHeight?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when code is copied */
  onCopy?: (code: string) => void;
  /** Callback when a line is clicked (requires enableLineHighlight) */
  onLineClick?: (lineNumber: number) => void;
  /** Callback when search is performed */
  onSearch?: (query: string, results: number[]) => void;
  /** Default badge variant for all badges */
  badgeVariant?: TBadgeVariant;
  /** Custom color for badges when variant is "custom" */
  badgeColor?: string;
  /** Custom color for file name label */
  fileNameColor?: string;
  /** Initial search query */
  initialSearchQuery?: string;
  /** Initial search results (line numbers) */
  initialSearchResults?: number[];
  /** Initial highlighted lines */
  initialHighlightedLines?: number[];
  /** Auto-scroll speed for badges (pixels per second, default: 20) */
  autoScrollSpeed?: number;
  /** Enable auto-scroll for badges (default: true) */
  enableAutoScroll?: boolean;
  /** Whether to show the language icon in header (default: false) */
  showIcon?: boolean;
  /** Show bottom fade effect (default: true) */
  showBottomFade?: boolean;
  /** Custom width */
  width?: string;
  /** Custom height */
  height?: string;
  /** Enable resizing with corner handles (default: false) */
  resizable?: boolean;
  /** Storage key for persisting resize dimensions (default: 'codeblock-resize') */
  resizeStorageKey?: string;
  /** Disable search functionality entirely (default: false) */
  disableSearch?: boolean;
  /** Disable copy functionality entirely (default: false) */
  disableCopy?: boolean;
  /** Disable the entire top bar/header (default: false) */
  disableTopBar?: boolean;
};

// ============================================================================
// OPTIMIZED BADGE UTILITIES
// ============================================================================

type TBadgeProps = {
  variant?: TBadgeVariant;
  customColor?: string;
  customClass?: string;
};

const getBadgeClasses = ({ variant = "default", customClass }: TBadgeProps): string => {
  const base = "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 shrink-0 whitespace-nowrap shadow-sm"; // Enhanced padding and added whitespace-nowrap and shadow

  if (variant === "custom") {
    return customClass
      ? cn(base, customClass)
      : cn(base, "bg-gradient-to-r from-pink-500 to-purple-500 text-white border border-pink-500/30 hover:shadow-md");
  }

  const variants = {
    primary: "border border-gray-500/30 bg-gray-500/10 text-gray-400 hover:border-gray-400 hover:text-gray-300 hover:shadow-md",
    secondary: "border border-emerald-400/50 bg-emerald-500/5 text-emerald-300 hover:border-emerald-300 hover:bg-emerald-500/10 hover:shadow-emerald-500/20 hover:shadow-lg",
    success: "border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:border-orange-400 hover:text-orange-300 hover:shadow-md",
    warning: "border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-md",
    danger: "border border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-400 hover:text-red-300 hover:shadow-md",
    default: "border border-[#333333] bg-[#111111] text-zinc-400 hover:border-[#444444] hover:text-zinc-300 hover:shadow-md",
  };
  return cn(base, variants[variant]);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Beautiful Code Block Component - Ultra Optimized for Size with Auto-Scroll Badges
 *
 * A comprehensive code display component with syntax highlighting, search,
 * line highlighting, copy functionality, and custom badges with auto-scroll.
 *
 * @example
 * <CodeBlock
 *   code="const hello = 'world';"
 *   language="javascript"
 *   fileName="example.js"
 *   badges={[{ text: 'JS', variant: 'primary' }]}
 *   showLineNumbers
 *   enableLineHighlight
 *   enableAutoScroll
 * />
 */
export function CodeBlock({
  code,
  language,
  fileName,
  badges = [],
  showLineNumbers = true,
  enableLineHighlight = false,
  enableLineHover = false,
  hoverHighlightColor,
  showMetaInfo = true,
  maxHeight = "400px",
  className,
  onCopy,
  onLineClick,
  onSearch,
  badgeVariant = "default",
  badgeColor,
  fileNameColor,
  initialSearchQuery = "",
  initialSearchResults = [],
  initialHighlightedLines = [],
  autoScrollSpeed = 20,
  enableAutoScroll = true,
  showIcon = false,
  showBottomFade = true,
  width,
  height,
  resizable = false,
  resizeStorageKey = 'codeblock-resize',
  disableSearch = false,
  disableCopy = false,
  disableTopBar = false,
}: TCodeBlockProps) {
  // State management
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearching, setIsSearching] = useState(!!initialSearchQuery);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<number[]>(initialSearchResults);
  const [currentResultIndex, setCurrentResultIndex] = useState(initialSearchResults.length > 0 ? 0 : -1);
  const [highlightedLines, setHighlightedLines] = useState<number[]>(initialHighlightedLines);
  const [scrollPosition, setScrollPosition] = useState<'start' | 'middle' | 'end'>('start');
  const [isAutoScrolling, setIsAutoScrolling] = useState(enableAutoScroll);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [hasResultsAbove, setHasResultsAbove] = useState(false);
  const [hasResultsBelow, setHasResultsBelow] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDimensions, setResizeDimensions] = useState({ width: width || 'auto', height: height || '400px' });
  const [showSearchAnimation, setShowSearchAnimation] = useState(isSearching);
  const [showContentAnimation, setShowContentAnimation] = useState(!isCollapsed);
  const [showToastAnimation, setShowToastAnimation] = useState(false);

  // Theme detection
  const isDark = useIsDarkMode();

  // Refs
  const codeRef = useRef<HTMLDivElement>(null);
  const badgeScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Memoized values
  const stats = useMemo(() => calculateCodeStats(code), [code]);
  const hoverColorStyle = useMemo(() => ({
    ['--bcv2-hover-color' as any]: hoverHighlightColor || (isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.03)")
  }), [hoverHighlightColor, isDark]);

  // Generate line background color based on state priority: clicked > search > hover
  const getLineBackgroundColor = useCallback((lineNumber: number): string => {
    // Priority 1: Click-highlighted lines (highest priority)
    if (highlightedLines.includes(lineNumber)) {
      return isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
    }

    // Priority 2: Search results (medium priority)
    if (searchResults.includes(lineNumber)) {
      return isDark ? "rgba(212, 212, 216, 0.15)" : "rgba(72, 72, 74, 0.1)";
    }

    // Priority 3: Hover state (lowest priority)
    if (enableLineHover && hoveredLine === lineNumber) {
      return hoverHighlightColor || (isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.03)");
    }

    return "transparent";
  }, [highlightedLines, searchResults, hoveredLine, enableLineHover, hoverHighlightColor, isDark]);

  // Hover handlers
  const handleLineMouseEnter = useCallback((lineNumber: number) => {
    if (enableLineHover) {
      setHoveredLine(lineNumber);
    }
  }, [enableLineHover]);

  const handleLineMouseLeave = useCallback(() => {
    if (enableLineHover) {
      setHoveredLine(null);
    }
  }, [enableLineHover]);

  // Auto-scroll functionality for badges
  useEffect(() => {
    const element = badgeScrollRef.current;
    if (!element || !isAutoScrolling || badges.length === 0) return;

    let animationId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Calculate scroll position based on time
      const scrollAmount = (elapsed * autoScrollSpeed) / 1000;

      // Check if we've reached the end, reset to beginning for infinite scroll
      if (element.scrollLeft >= element.scrollWidth - element.clientWidth) {
        element.scrollLeft = 0;
        startTime = timestamp; // Reset timer
      } else {
        element.scrollLeft = scrollAmount % (element.scrollWidth - element.clientWidth);
      }

      animationId = requestAnimationFrame(animate);
    };

    // Only start auto-scroll if content overflows
    if (element.scrollWidth > element.clientWidth) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [badges, isAutoScrolling, autoScrollSpeed]);

  // Check if search results are visible in viewport
  const updateSearchIndicators = useCallback(() => {
    if (searchResults.length === 0) {
      setHasResultsAbove(false);
      setHasResultsBelow(false);
      return;
    }

    const container = codeRef.current?.querySelector('[style*="maxHeight"]') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;

    let hasAbove = false;
    let hasBelow = false;

    searchResults.forEach((lineNumber) => {
      const lineElement = codeRef.current?.querySelector(`[data-line-number="${lineNumber}"]`) as HTMLElement;
      if (lineElement) {
        const lineRect = lineElement.getBoundingClientRect();
        const lineTop = lineRect.top;
        const lineBottom = lineRect.bottom;

        if (lineTop < containerTop) {
          hasAbove = true;
        }
        if (lineBottom > containerBottom) {
          hasBelow = true;
        }
      }
    });

    setHasResultsAbove(hasAbove);
    setHasResultsBelow(hasBelow);
  }, [searchResults]);

  // Enhanced scroll to specific line with viewport checking
  const scrollToLine = useCallback((lineNumber: number) => {
    const lineElement = codeRef.current?.querySelector(`[data-line-number="${lineNumber}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Update indicators after scrolling
      setTimeout(() => {
        updateSearchIndicators();
      }, 100);
    }
  }, [updateSearchIndicators]);

  // Load saved dimensions from localStorage
  useEffect(() => {
    if (resizable && resizeStorageKey) {
      try {
        const saved = localStorage.getItem(resizeStorageKey);
        if (saved) {
          const dimensions = JSON.parse(saved);
          setResizeDimensions(dimensions);
        }
      } catch (error) {
        console.warn('Failed to load saved dimensions:', error);
      }
    }
  }, [resizable, resizeStorageKey]);

  // Save dimensions to localStorage
  const saveDimensions = useCallback((dimensions: { width: string; height: string }) => {
    if (resizable && resizeStorageKey) {
      try {
        localStorage.setItem(resizeStorageKey, JSON.stringify(dimensions));
      } catch (error) {
        console.warn('Failed to save dimensions:', error);
      }
    }
  }, [resizable, resizeStorageKey]);

  // Resize functionality
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    e.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Get parent container bounds
    const parentContainer = container.parentElement;
    const parentRect = parentContainer?.getBoundingClientRect();

    // Calculate new dimensions
    // Width: distance from left edge to mouse X
    const newWidth = Math.max(200, e.clientX - rect.left);
    // Height: distance from top edge to mouse Y (for bottom-right corner resize)
    const newHeight = Math.max(150, e.clientY - rect.top);

    // Constrain to parent container if it exists
    let constrainedWidth = newWidth;
    let constrainedHeight = newHeight;

    if (parentRect) {
      const maxWidth = parentRect.width - (rect.left - parentRect.left);
      const maxHeight = parentRect.height - (rect.top - parentRect.top);

      constrainedWidth = Math.min(newWidth, maxWidth);
      constrainedHeight = Math.min(newHeight, maxHeight);
    }

    const dimensions = {
      width: `${constrainedWidth}px`,
      height: `${constrainedHeight}px`
    };

    setResizeDimensions(dimensions);
    saveDimensions(dimensions);
  }, [isResizing, saveDimensions]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add resize event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  // Search handler with debouncing via useEffect
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query) {
        setSearchResults([]);
        setCurrentResultIndex(-1);
        setHighlightedLines([]);
        onSearch?.("", []);
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
      onSearch?.(query, matches);

      if (matches.length > 0) {
        scrollToLine(matches[0]);
      }
    },
    [code, onSearch, scrollToLine],
  );

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  // Update search indicators when results change
  useEffect(() => {
    updateSearchIndicators();
  }, [searchResults, updateSearchIndicators]);

  // Add scroll listener to update indicators
  useEffect(() => {
    const container = codeRef.current?.querySelector('[style*="maxHeight"]') as HTMLElement;
    if (!container) return;

    const handleScroll = () => {
      updateSearchIndicators();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateSearchIndicators]);

  // Manage search animation state
  useEffect(() => {
    if (isSearching !== showSearchAnimation) {
      const timer = setTimeout(() => setShowSearchAnimation(isSearching), 10);
      return () => clearTimeout(timer);
    }
  }, [isSearching, showSearchAnimation]);

  // Manage content animation state
  useEffect(() => {
    if (isCollapsed !== showContentAnimation) {
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

  // Copy to clipboard
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

  // Search navigation
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

  // Line click handler
  const handleLineClick = useCallback(
    (lineNumber: number) => {
      if (enableLineHighlight) {
        setHighlightedLines((prev) =>
          prev.includes(lineNumber)
            ? prev.filter((line) => line !== lineNumber)
            : [...prev, lineNumber],
        );
        onLineClick?.(lineNumber);
      }
    },
    [enableLineHighlight, onLineClick],
  );

  // Keyboard shortcuts
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

  // Drag-to-scroll functionality for badges
  useEffect(() => {
    const slider = badgeScrollRef.current;
    if (!slider) return;

    const mouseDownHandler = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button
      setIsDragging(true);
      setIsAutoScrolling(false); // Stop auto-scroll when dragging
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
    };

    const mouseUpHandler = () => {
      setIsDragging(false);
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 2;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener('mousedown', mouseDownHandler);
    slider.addEventListener('mouseup', mouseUpHandler);
    slider.addEventListener('mouseleave', mouseUpHandler);
    slider.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      slider.removeEventListener('mousedown', mouseDownHandler);
      slider.removeEventListener('mouseup', mouseUpHandler);
      slider.removeEventListener('mouseleave', mouseUpHandler);
      slider.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [isDragging]);

  // Custom line renderer with enhanced highlighting
  const renderLine = useCallback((line: string, i: number) => {
    const lineNumber = i + 1;
    const isHighlighted = highlightedLines.includes(lineNumber);
    const isSearchResult = searchResults.includes(lineNumber);
    const isHovered = hoveredLine === lineNumber;
    const backgroundColor = getLineBackgroundColor(lineNumber);

    return (
      <div
        key={i}
        data-line-number={lineNumber}
        className={cn(
          "table-row transition-colors duration-200",
          enableLineHighlight && "cursor-pointer",
          enableLineHover && "hover:bg-opacity-80"
        )}
        style={{
          backgroundColor,
        }}
        onMouseEnter={() => handleLineMouseEnter(lineNumber)}
        onMouseLeave={handleLineMouseLeave}
        onClick={() => handleLineClick(lineNumber)}
      >
        {showLineNumbers && (
          <span
            className={cn(
              "table-cell w-12 pr-4 text-right select-none",
              "text-[var(--bcv2-line-number-color)]",
              "border-r border-r-[var(--bcv2-border-color)]",
              "transition-colors duration-200"
            )}
            style={{
              '--bcv2-line-number-color': isDark ? "#636e7b" : "#94a3b8",
              '--bcv2-border-color': isDark ? "#1e293b" : "#e2e8f0",
            } as CSSProperties}
          >
            {lineNumber}
          </span>
        )}
        <div className="table-cell">
          {line}
        </div>
      </div>
    );
  }, [
    highlightedLines,
    searchResults,
    hoveredLine,
    enableLineHighlight,
    enableLineHover,
    showLineNumbers,
    getLineBackgroundColor,
    handleLineMouseEnter,
    handleLineMouseLeave,
    handleLineClick,
    isDark,
  ]);

  // Render the code content
  const renderCode = useCallback(() => {
    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {code.split('\n').map((line, i) => renderLine(line, i))}
        </div>
      </div>
    );
  }, [code, renderLine]);

  // Return the complete component
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group font-mono text-sm",
        "border border-[var(--bcv2-border-color)] rounded-lg",
        "bg-[var(--bcv2-bg-color)]",
        "transition-all duration-300",
        "hover:border-[var(--bcv2-border-color-hover)]",
        resizable && "resize",
        className
      )}
      style={{
        '--bcv2-bg-color': isDark ? "#09090b" : "#ffffff",
        '--bcv2-border-color': isDark ? "#27272a" : "#e4e4e7",
        '--bcv2-border-color-hover': isDark ? "#3f3f46" : "#d4d4d8",
        '--bcv2-hover-color': hoverHighlightColor || (isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.03)"),
        width: resizeDimensions.width,
        height: resizeDimensions.height,
        ...hoverColorStyle,
      } as CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      {!disableTopBar && (
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-[var(--bcv2-border-color)]"
          style={{
            background: isDark ? "linear-gradient(135deg, #18181b 0%, #09090b 100%)" : "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Language Icon */}
            {showIcon && (
              <div
                style={{
                  '--bcv2-icon-color': isDark ? "#94a3b8" : "#64748b",
                } as CSSProperties}
              >
                <SimpleIcon
                  language={language}
                  size={16}
                  className="text-[var(--bcv2-icon-color)]"
                />
              </div>
            )}

            {/* File Name */}
            {fileName && (
              <span
                className="font-medium text-sm truncate mr-2"
                style={{
                  color: fileNameColor || (isDark ? "#f1f5f9" : "#0f172a"),
                }}
              >
                {fileName}
              </span>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div
                ref={badgeScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseEnter={() => setIsAutoScrolling(false)}
                onMouseLeave={() => setIsAutoScrolling(enableAutoScroll)}
              >
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={getBadgeClasses({
                      variant: badge.variant || badgeVariant,
                      customClass: badge.customClass,
                    })}
                    style={
                      badge.variant === "custom" && badgeColor
                        ? { backgroundColor: badgeColor }
                        : {}
                    }
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {!disableSearch && (
              <>
                {showSearchAnimation && (
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      showSearchAnimation && "codeblock-search-toggle"
                    )}
                  >
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[var(--bcv2-search-icon-color)]" size={14} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-32 h-7 pl-7 pr-2 text-xs rounded border border-[var(--bcv2-border-color)] bg-[var(--bcv2-search-bg)] text-[var(--bcv2-search-text)] placeholder-[var(--bcv2-search-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--bcv2-search-ring)]"
                        style={{
                          '--bcv2-search-bg': isDark ? "#18181b" : "#fafafa",
                          '--bcv2-search-text': isDark ? "#fafafa" : "#09090b",
                          '--bcv2-search-placeholder': isDark ? "#64748b" : "#94a3b8",
                          '--bcv2-search-icon-color': isDark ? "#64748b" : "#94a3b8",
                          '--bcv2-search-ring': isDark ? "#71717a" : "#a1a1aa",
                        } as CSSProperties}
                        autoFocus
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-[var(--bcv2-search-results-color)]">
                        <span>{currentResultIndex + 1}/{searchResults.length}</span>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={goToPreviousResult}
                            disabled={searchResults.length === 0}
                            className="h-5 w-5"
                          >
                            <ArrowUp size={12} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={goToNextResult}
                            disabled={searchResults.length === 0}
                            className="h-5 w-5"
                          >
                            <ArrowDown size={12} />
                          </Button>
                        </div>
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery("");
                        setSearchResults([]);
                        setHighlightedLines([]);
                      }}
                      className="h-5 w-5"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Search Toggle */}
            {!disableSearch && !isSearching && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSearching(true)}
                className="h-7 w-7"
              >
                <Search size={14} />
              </Button>
            )}

            {/* Copy Button */}
            {!disableCopy && (
              <Button
                size="icon"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-7 w-7"
              >
                {isCopied ? (
                  <div className={cn("codeblock-copy-success")}>
                    <Check size={14} />
                  </div>
                ) : (
                  <div>
                    <Copy size={14} />
                  </div>
                )}
              </Button>
            )}

            {/* Collapse Toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7"
            >
              <div className={cn(isCollapsed && "codeblock-chevron-rotate")}>
                <ChevronDown size={14} />
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Code Content */}
      <>
        {showContentAnimation && (
          <div
            className={cn(
              "relative overflow-auto",
              showContentAnimation && "codeblock-expand"
            )}
            style={{ maxHeight: height || maxHeight }}
          >
            {/* Search Indicators */}
            {searchResults.length > 0 && (hasResultsAbove || hasResultsBelow) && (
              <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none z-10">
                {hasResultsAbove && (
                  <div className="bg-gradient-to-b from-[var(--bcv2-search-indicator)] to-transparent w-full h-4" />
                )}
              </div>
            )}
            {(searchResults.length > 0 && hasResultsBelow) && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-between pointer-events-none z-10">
                <div className="bg-gradient-to-t from-[var(--bcv2-search-indicator)] to-transparent w-full h-4" />
              </div>
            )}

            <div ref={codeRef} className="p-4">
              {React.createElement(SyntaxHighlighter as any, {
                language: language,
                style: isDark ? customTheme : customThemeLight,
                PreTag: "div",
                CodeTag: "div",
                showLineNumbers: false, // We handle line numbers manually
                useStyleTags: false,
                customStyle: {
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                  fontSize: '14px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
                children: code
              })}
            </div>
          </div>
        )}
      </>

      {/* Resize Handle */}
      {resizable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-0 group-hover:opacity-50 transition-opacity"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, currentColor 50%)',
            color: isDark ? "#64748b" : "#94a3b8",
          }}
        />
      )}

      {/* Bottom Fade Effect */}
      {showBottomFade && !isCollapsed && (
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to bottom, transparent, ${isDark ? "#0f172a" : "#ffffff"})`,
          }}
        />
      )}
    </div>
  );
}
