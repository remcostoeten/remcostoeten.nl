'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionProps {
    children: ReactNode;
    title?: string;
    icon?: LucideIcon;
    className?: string;
    headerAction?: ReactNode;
    noPadding?: boolean;
}

/**
 * Bordered section component for consistent layout
 * Inspired by chanhdai.com design pattern
 */
export function Section({
    children,
    title,
    icon: Icon,
    className = '',
    headerAction,
    noPadding = false
}: SectionProps) {
    return (
        <section className={`relative ${className}`}>
            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-[2px] overflow-hidden">
                {title && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                            {Icon && (
                                <div className="flex size-5 items-center justify-center text-muted-foreground">
                                    <Icon className="size-4" />
                                </div>
                            )}
                            <h2 className="text-sm font-medium text-foreground tracking-tight">
                                {title}
                            </h2>
                        </div>
                        {headerAction && (
                            <div className="text-xs text-muted-foreground">
                                {headerAction}
                            </div>
                        )}
                    </div>
                )}

                <div className={noPadding ? '' : 'p-4'}>
                    {children}
                </div>
            </div>
        </section>
    );
}

/**
 * Sub-section for nested content within a Section
 */
export function SubSection({
    children,
    title,
    icon: Icon,
    className = ''
}: {
    children: ReactNode;
    title?: string;
    icon?: LucideIcon;
    className?: string;
}) {
    return (
        <div className={`rounded-lg border border-border/30 bg-background/50 ${className}`}>
            {title && (
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30">
                    {Icon && <Icon className="size-3.5 text-muted-foreground" />}
                    <span className="text-xs font-medium text-muted-foreground">{title}</span>
                </div>
            )}
            <div className="p-3">
                {children}
            </div>
        </div>
    );
}

/**
 * Timeline item for activity feeds
 */
export function TimelineItem({
    children,
    icon: Icon,
    title,
    indicator,
    className = ''
}: {
    children: ReactNode;
    icon?: LucideIcon;
    title: string;
    indicator?: ReactNode;
    className?: string;
}) {
    return (
        <div className={`relative pl-7 pb-4 last:pb-0 ${className}`}>
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border/50 last:hidden" />

            <div className="absolute left-0 top-0.5 flex size-6 items-center justify-center rounded-md bg-muted/80 border border-border/50">
                {Icon && <Icon className="size-3.5 text-muted-foreground" />}
            </div>

            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
                    {indicator}
                </div>
                <div className="text-sm text-muted-foreground">
                    {children}
                </div>
            </div>
        </div>
    );
}
