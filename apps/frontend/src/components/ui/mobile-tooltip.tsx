'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type TMobileTooltipProps = {
    children: React.ReactNode;
    content: string;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
};

export function MobileTooltip({
    children,
    content,
    className,
    side = "top",
    sideOffset = 4
}: TMobileTooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [hasBeenSeen, setHasBeenSeen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const handleTouch = React.useCallback(() => {
        if (isMobile) {
            if (isVisible) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
                setHasBeenSeen(true);
            }
        }
    }, [isMobile, isVisible]);

    React.useEffect(() => {
        if (!triggerRef.current || !isMobile) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasBeenSeen) {
                        setHasBeenSeen(true);
                        setIsVisible(true);
                    }
                });
            },
            {
                threshold: 0.3, // Trigger when 30% of the element is visible
                rootMargin: "0px 0px -20% 0px" // Trigger when element is in the center area of viewport
            }
        );

        observer.observe(triggerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [isMobile, hasBeenSeen]);

    // Handle clicks outside to dismiss tooltip
    React.useEffect(() => {
        if (!isMobile || !isVisible) return;

        const handleClickOutside = (event: TouchEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };

        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMobile, isVisible]);

    const getPositionClasses = () => {
        switch (side) {
            case "top":
                return "bottom-full mb-2 left-1/2 transform -translate-x-1/2";
            case "bottom":
                return "top-full mt-2 left-1/2 transform -translate-x-1/2";
            case "left":
                return "right-full mr-2 top-1/2 transform -translate-y-1/2";
            case "right":
                return "left-full ml-2 top-1/2 transform -translate-y-1/2";
            default:
                return "bottom-full mb-2 left-1/2 transform -translate-x-1/2";
        }
    };

    const getArrowClasses = () => {
        switch (side) {
            case "top":
                return "top-full left-1/2 transform -translate-x-1/2 border-t-accent/20 border-l-transparent border-r-transparent border-b-transparent";
            case "bottom":
                return "bottom-full left-1/2 transform -translate-x-1/2 border-b-accent/20 border-l-transparent border-r-transparent border-t-transparent";
            case "left":
                return "left-full top-1/2 transform -translate-y-1/2 border-l-accent/20 border-t-transparent border-b-transparent border-r-transparent";
            case "right":
                return "right-full top-1/2 transform -translate-y-1/2 border-r-accent/20 border-t-transparent border-b-transparent border-l-transparent";
            default:
                return "top-full left-1/2 transform -translate-x-1/2 border-t-accent/20 border-l-transparent border-r-transparent border-b-transparent";
        }
    };

    if (!isMobile) {
        // On desktop, render as a regular tooltip trigger
        return <>{children}</>;
    }

    return (
        <div
            ref={triggerRef}
            className="relative inline-block"
            onTouchStart={handleTouch}
        >
            {children}

            {isVisible && hasBeenSeen && (
                <div
                    className={cn(
                        "absolute z-50 px-3 py-1.5 text-sm text-popover-foreground bg-popover border border-accent/20 rounded-md shadow-lg shadow-accent/10 animate-in fade-in-0 zoom-in-95",
                        getPositionClasses(),
                        className
                    )}
                    role="tooltip"
                    aria-live="polite"
                >
                    {content}

                    {/* Arrow */}
                    <div
                        className={cn(
                            "absolute w-0 h-0 border-4",
                            getArrowClasses()
                        )}
                    />
                </div>
            )}
        </div>
    );
}
