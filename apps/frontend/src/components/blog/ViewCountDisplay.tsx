'use client';

import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewCountDisplayProps {
    viewCount: number;
    className?: string;
    showIcon?: boolean;
    variant?: 'default' | 'compact' | 'large';
}

export function ViewCountDisplay({
    viewCount,
    className,
    showIcon = true,
    variant = 'default'
}: ViewCountDisplayProps) {
    const formatCount = (count: number): string => {
        if (count === 0) return '0 views';
        if (count === 1) return '1 view';
        if (count < 1000) return `${count} views`;
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k views`;
        return `${(count / 1000000).toFixed(1)}M views`;
    };

    const baseClasses = "flex items-center gap-1 text-muted-foreground";

    const variantClasses = {
        default: "text-xs",
        compact: "text-xs",
        large: "text-sm"
    };

    const iconSizes = {
        default: "w-3 h-3",
        compact: "w-3 h-3",
        large: "w-4 h-4"
    };

    return (
        <div className={cn(baseClasses, variantClasses[variant], className)}>
            {showIcon && <Eye className={iconSizes[variant]} />}
            <span>{formatCount(viewCount)}</span>
        </div>
    );
}