'use client';

import React, { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

type TProps = {
    children: ReactNode;
    fullHeight?: boolean;
    fullWidth?: boolean;
    direction?: 'row' | 'col';
    gap?: number | string;
    padding?: number | string;
    bg?: string;
    style?: CSSProperties;
    className?: string;
    animate?: boolean;
    justify?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
    align?: 'center' | 'start' | 'end' | 'stretch' | 'baseline';
};

export function Center({
    children,
    fullHeight = true,
    fullWidth = true,
    direction = 'col',
    gap = 0,
    padding = 0,
    bg,
    style,
    className = '',
    animate = false,
    justify = 'center',
    align = 'center',
}: TProps) {
    const baseClasses = [
        'flex',
        `flex-${direction}`,
        `justify-${justify}`,
        `items-${align}`,
        fullHeight ? 'min-h-screen' : '',
        fullWidth ? 'w-full' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const Comp = animate ? motion.div : 'div';

    return (
        <Comp
            {...(animate
                ? {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { duration: 0.3, ease: 'easeOut' },
                }
                : {})}
            className={baseClasses}
            style={{
                gap,
                padding,
                backgroundColor: bg,
                ...style,
            }}
        >
            {children}
        </Comp>
    );
}
