"use client"

import React, { type ComponentProps, type ReactNode } from "react"
import { AnimatedNumber } from "@/components/ui/effects/animated-number"

// =============================================================================
// COLOR & STYLE CONSTANTS - Customize these for your brand
// =============================================================================

export const SECTION_HEADING_COLORS = {
    light: {
        background: "bg-white",
        border: "border-neutral-200",
        patternFill: "fill-neutral-200",
        leftText: "text-muted-foreground",
        rightText: "text-muted-foreground/60",
        iconColor: "text-primary/70",
    },
    dark: {
        background: "bg-neutral-950",
        border: "border-neutral-800",
        patternFill: "fill-neutral-800",
        leftText: "text-muted-foreground",
        rightText: "text-muted-foreground/60",
        iconColor: "text-primary/70",
    },
} as const

export const SECTION_HEADING_DEFAULTS = {
    height: 48,
    marginBottom: 0,
    patternSize: 16,
    fontSize: {
        left: "text-sm font-medium",
        right: "text-sm",
    },
} as const

// =============================================================================
// TYPES
// =============================================================================

type AnimatedNumberProps = ComponentProps<typeof AnimatedNumber>

export type Props = {
    /** Left side label text */
    leftText: string
    /** Optional icon to display before left text */
    leftIcon?: ReactNode

    /** Right side text/value (optional) */
    rightText?: string | number
    /** Wrap rightText in AnimatedNumber component */
    useAnimatedNumber?: boolean
    /** Props to pass to AnimatedNumber when useAnimatedNumber is true */
    animatedNumberProps?: Omit<AnimatedNumberProps, "value">

    /** Theme variant */
    theme?: "light" | "dark"

    /** Additional CSS classes */
    className?: string
    /** Bottom margin in pixels or CSS value */
    marginBottom?: number | string
    /** Section height in pixels or CSS value */
    height?: number | string

    /** Override colors (partial) */
    colors?: Partial<(typeof SECTION_HEADING_COLORS)["light"]>

    /** Custom pattern size in pixels */
    patternSize?: number

    /** Background style: 'dot' or various line patterns */
    bgStyle?: "dot" | "diagonal-right" | "diagonal-left" | "vertical" | "horizontal" | "mesh"

    /** Background animation speed: 'slow', 'medium', 'fast' or false to disable */
    bgAnimation?: boolean | "slow" | "medium" | "fast"
    /** Custom animation duration in seconds */
    animationSpeed?: number
    /** Stagger the background pattern for a more dynamic, non-uniform look */
    stagger?: boolean

    /** Max width of the content container (e.g., '42rem', '100%') */
    maxWidth?: number | string

    /** HTML heading level for SEO (default: h2) */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div"
    /** Whether the heading should ignore container width and span the full viewport (default: false) */
    fullBleed?: boolean
}

// =============================================================================
// PATTERN COMPONENTS
// =============================================================================

const ANIMATION_DURATIONS = {
    slow: 12,
    medium: 6,
    fast: 3,
} as const

function DotPattern({
    size,
    fillClass,
    animate = false,
    duration = 40,
    opacity = 1,
    offset = 0,
    delay = 0,
}: {
    size: number
    fillClass: string
    animate?: boolean
    duration?: number
    opacity?: number
    offset?: number
    delay?: number
}) {
    const patternId = React.useId().replace(/:/g, '')

    return (
        <svg
            className="absolute inset-0 h-full w-full"
            style={{
                opacity,
                animation: animate ? `dot-move-${patternId} ${duration}s linear infinite` : "none",
                animationDelay: `${delay}s`,
            }}
            aria-hidden="true"
        >
            <style>
                {`
          @keyframes dot-move-${patternId} {
            from { transform: translate(${offset}px, ${offset}px); }
            to { transform: translate(${size + offset}px, ${size + offset}px); }
          }
        `}
            </style>
            <defs>
                <pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse">
                    <circle cx={size / 2} cy={size / 2} r={1} className={fillClass} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
    )
}

function LinePattern({
    variant = "diagonal-right",
    animate = false,
    duration = 40,
    opacity = 1,
    className = "",
    offset = 0,
    delay = 0,
}: {
    variant?: "diagonal-right" | "diagonal-left" | "vertical" | "horizontal" | "mesh"
    animate?: boolean
    duration?: number
    opacity?: number
    className?: string
    offset?: number
    delay?: number
}) {
    const animId = React.useId().replace(/:/g, '')
    const color = "hsl(0 0% 85% / 0.03)"
    const size = 15

    const patterns: Record<string, string> = {
        "diagonal-right": `repeating-linear-gradient(-45deg, transparent, transparent 2px, ${color} 2px, ${color} 3px)`,
        "diagonal-left": `repeating-linear-gradient(45deg, transparent, transparent 2px, ${color} 2px, ${color} 3px)`,
        vertical: `repeating-linear-gradient(90deg, transparent, transparent 2px, ${color} 2px, ${color} 3px)`,
        horizontal: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${color} 2px, ${color} 3px)`,
        mesh: `repeating-linear-gradient(-45deg, transparent, transparent 2px, ${color} 2px, ${color} 3px), repeating-linear-gradient(45deg, transparent, transparent 2px, ${color} 2px, ${color} 3px)`,
    }

    // Calculate smooth animation endpoint based on pattern size for seamless loop
    const getKeyframes = () => {
        const o = offset
        const s2 = size * 2
        switch (variant) {
            case "diagonal-right":
                return `from { background-position: ${o}px ${o}px; } to { background-position: ${s2 + o}px ${-s2 + o}px; }`
            case "diagonal-left":
                return `from { background-position: ${o}px ${o}px; } to { background-position: ${-s2 + o}px ${-s2 + o}px; }`
            case "vertical":
                return `from { background-position: ${o}px 0; } to { background-position: ${s2 + o}px 0; }`
            case "horizontal":
                return `from { background-position: 0 ${o}px; } to { background-position: 0 ${s2 + o}px; }`
            case "mesh":
                return `from { background-position: ${o}px ${o}px, ${-o}px ${o}px; } to { background-position: ${s2 + o}px ${-s2 + o}px, ${-s2 - o}px ${-s2 + o}px; }`
            default:
                return ""
        }
    }

    return (
        <div
            className={`absolute inset-0 h-full w-full ${className}`}
            style={{
                opacity,
                background: patterns[variant],
                backgroundSize: `${size}px ${size}px`,
                animation: animate ? `line-anim-${animId} ${duration}s linear infinite` : "none",
                animationDelay: `${delay}s`,
            }}
            aria-hidden="true"
        >
            <style>
                {`@keyframes line-anim-${animId} { ${getKeyframes()} }`}
            </style>
        </div>
    )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SectionHeading({
    leftText,
    leftIcon,
    rightText,
    useAnimatedNumber = false,
    animatedNumberProps,
    theme = "dark",
    className = "",
    marginBottom = SECTION_HEADING_DEFAULTS.marginBottom,
    height = SECTION_HEADING_DEFAULTS.height,
    colors: colorOverrides,
    patternSize = SECTION_HEADING_DEFAULTS.patternSize,
    bgStyle = "dot",
    bgAnimation = false,
    animationSpeed,
    stagger = false,
    maxWidth = "42rem",
    as: Component = "h2",
    fullBleed = false,
}: Props) {
    // Merge default colors with overrides
    const colors = {
        ...SECTION_HEADING_COLORS[theme],
        ...colorOverrides,
    }

    // Compute styles
    const heightStyle = typeof height === "number" ? `${height}px` : height
    const marginStyle = typeof marginBottom === "number" ? `${marginBottom}px` : marginBottom
    const maxWidthStyle = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth

    // Animation settings
    const isAnimated = !!bgAnimation
    const duration =
        animationSpeed ??
        (typeof bgAnimation === "string" ? ANIMATION_DURATIONS[bgAnimation] : ANIMATION_DURATIONS.slow)

    // Render right side content
    const renderRightContent = () => {
        if (rightText === undefined || rightText === null) return null

        if (useAnimatedNumber) {
            return (
                <AnimatedNumber
                    value={rightText}
                    className={`${SECTION_HEADING_DEFAULTS.fontSize.right} ${colors.rightText}`}
                    initialProgress={0}
                    {...animatedNumberProps}
                />
            )
        }

        return <span className={`${SECTION_HEADING_DEFAULTS.fontSize.right} ${colors.rightText}`}>{rightText}</span>
    }

    const rightContent = renderRightContent()

    return (
        <div
            className={`relative ${className}`}
            style={{
                ...(fullBleed ? {
                    width: "100vw",
                    marginLeft: "calc(-50vw + 50%)",
                } : {
                    width: "100%",
                }),
                marginBottom: marginStyle,
            }}
        >
            <Component
                className={`
          relative overflow-hidden
          ${colors.background}
          border-y ${colors.border}
        `.trim()}
                style={{ height: heightStyle }}
            >
                {/* Background patterns - full bleed */}
                <div className="absolute inset-0 z-0">
                    {bgStyle === "dot" ? (
                        <>
                            <DotPattern
                                size={patternSize}
                                fillClass={colors.patternFill}
                                animate={isAnimated}
                                duration={duration}
                            />
                            {stagger && (
                                <DotPattern
                                    size={patternSize}
                                    fillClass={colors.patternFill}
                                    animate={isAnimated}
                                    duration={duration * 1.5}
                                    opacity={0.4}
                                    offset={patternSize / 4}
                                    delay={-duration * 0.2}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <LinePattern
                                variant={bgStyle as any}
                                animate={isAnimated}
                                duration={duration}
                            />
                            {stagger && (
                                <LinePattern
                                    variant={bgStyle as any}
                                    animate={isAnimated}
                                    duration={duration * 1.8}
                                    opacity={0.6}
                                    offset={8}
                                    delay={-duration * 0.5}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Content container */}
                <div
                    className="relative header-content-container z-10 mx-auto flex h-full items-center justify-between px-4 md:px-5"
                    style={{ maxWidth: maxWidthStyle }}
                >
                    {/* Left side: icon + label */}
                    <div className="flex items-center gap-2">
                        {leftIcon && (
                            <span className={colors.iconColor} aria-hidden="true">
                                {leftIcon}
                            </span>
                        )}
                        <span className={`${SECTION_HEADING_DEFAULTS.fontSize.left} ${colors.leftText} select-text`}>{leftText}</span>
                    </div>

                    {/* Right side: optional text/animated number */}
                    {rightContent && (
                        <div className="flex items-center select-text" aria-live="polite">
                            {rightContent}
                        </div>
                    )}
                </div>
            </Component>
        </div>
    )
}
