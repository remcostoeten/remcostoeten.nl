'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type BackgroundDirection = 'default' | 'horizontal' | 'vertical' | 'diagonal';
type ColorPattern = 'light' | 'dark';

interface HeadingProps {
    title: string;
    icon?: LucideIcon;
    headerAction?: ReactNode;
    className?: string;
    /** Remove margin-bottom from the header */
    noMargin?: boolean;
    /** Override default padding behavior */
    padding?: string;
    /** Custom background color */
    backgroundColor?: string;
    /** Custom border color */
    borderColor?: string;
    /** Direction of the background gradient/pattern */
    bgDirection?: BackgroundDirection;
    /** Color pattern for light/dark theme */
    colorPattern?: ColorPattern;
    /** Animate the background pattern to flow in its direction */
    animated?: boolean;
    /** Add a subtle color gradient overlay */
    hueOverlay?: boolean;
}

/**
 * Reusable heading component based on full-width-header pattern
 * Provides consistent full-width headers with optional actions and styling
 */
export function Heading({
    title,
    icon: Icon,
    headerAction,
    className = "",
    noMargin = false,
    padding,
    backgroundColor,
    borderColor,
    bgDirection = 'default',
    colorPattern = 'light',
    animated = false,
    hueOverlay = false
}: HeadingProps) {
    // Background gradient classes based on direction
    const bgDirectionClasses = {
        default: '',
        horizontal: 'bg-gradient-to-r',
        vertical: 'bg-gradient-to-b',
        diagonal: 'bg-gradient-to-br'
    };

    // Color pattern classes for light/dark themes
    const colorPatternClasses = {
        light: {
            from: 'from-background/50',
            via: 'via-background/30',
            to: 'to-background/10'
        },
        dark: {
            from: 'from-background/80',
            via: 'via-background/60',
            to: 'to-background/40'
        }
    };

    const bgClasses = bgDirectionClasses[bgDirection];
    const colorClasses = colorPatternClasses[colorPattern];
    const customBackground = backgroundColor || (bgDirection !== 'default' ? `${bgClasses} ${colorClasses.from} ${colorClasses.via} ${colorClasses.to}` : '');

    const headerClasses = [
        'full-width-header',
        noMargin && '!mb-0',
        customBackground,
        hueOverlay && 'hue-overlay',
        className
    ].filter(Boolean).join(' ');

    const containerClasses = [
        'header-content-container',
        'flex',
        'items-center',
        'justify-between',
        'header-content-container--with-padding',
        padding || ''
    ].filter(Boolean).join(' ');

    const customStyle: React.CSSProperties = borderColor ? {
        borderTopColor: borderColor,
        borderBottomColor: borderColor
    } : {};

    return (
        <div className={headerClasses} style={customStyle}>
            <div className={containerClasses}>
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {Icon && <Icon className="size-4" />}
                    {title}
                </h2>
                {headerAction && (
                    <div className="flex items-center gap-2">
                        {headerAction}
                    </div>
                )}
            </div>
        </div>
    );
}