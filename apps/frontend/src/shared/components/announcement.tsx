'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ArrowUpRightIcon, XIcon } from 'lucide-react';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                outline: 'text-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

type TBadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: TBadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

type TBadgeContext = { themed: boolean };

const BadgeContext = React.createContext<TBadgeContext>({ themed: false });

function useBadgeContext() {
    const context = React.useContext(BadgeContext);
    if (!context) {
        throw new Error('useBadgeContext must be used within a Badge');
    }
    return context;
}

type TAnnouncementProps = TBadgeProps & { themed?: boolean };

export function Announcement({ variant = 'outline', themed = false, className, ...props }: TAnnouncementProps) {
    return (
        <BadgeContext.Provider value={{ themed }}>
            <Badge
                variant={variant}
                className={cn(
                    'max-w-full gap-2 rounded-full bg-background px-3 py-0.5 font-medium shadow-sm transition-all hover:shadow-md',
                    themed && 'border-foreground/5',
                    className,
                )}
                {...props}
            />
        </BadgeContext.Provider>
    );
}

type TAnnouncementTagProps = React.HTMLAttributes<HTMLDivElement>;

export function AnnouncementTag({ className, ...props }: TAnnouncementTagProps) {
    const { themed } = useBadgeContext();
    return (
        <div
            className={cn('-ml-2.5 shrink-0 truncate rounded-full bg-foreground/5 px-2.5 py-1 text-xs', themed && 'bg-background/60', className)}
            {...props}
        />
    );
}

type TAnnouncementTitleProps = React.HTMLAttributes<HTMLDivElement>;

export function AnnouncementTitle({ className, ...props }: TAnnouncementTitleProps) {
    return <div className={cn('flex items-center gap-1 truncate py-1', className)} {...props} />;
}

export function AnnouncementBanner() {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragY, setDragY] = React.useState(0);
    const [startY, setStartY] = React.useState(0);

    React.useEffect(function init() {
        const dismissed = typeof window !== 'undefined' ? window.localStorage.getItem('announcement-dismissed') : 'true';
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    function handleClose() {
        setDragY(-200);
        window.setTimeout(function hide() {
            setIsVisible(false);
            window.localStorage.setItem('announcement-dismissed', 'true');
        }, 300);
    }

    function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
        setIsDragging(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setStartY(clientY);
    }

    function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
        if (!isDragging) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const diff = clientY - startY;
        if (diff < 0) setDragY(diff);
    }

    function handleDragEnd() {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragY < -50) handleClose();
        setDragY(0);
    }

    if (!isVisible) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
            <div
                className="relative mx-auto w-fit animate-in slide-in-from-top-full duration-500 ease-out pointer-events-auto"
                style={{
                    transform: `translateY(${dragY}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <Announcement themed className="border-border/60 bg-background/80 supports-[backdrop-filter]:backdrop-blur-sm text-foreground cursor-grab active:cursor-grabbing pr-10">
                    <AnnouncementTag className="-ml-1 bg-foreground/10 text-foreground px-2 py-0.5 leading-none">Blog</AnnouncementTag>
                    <AnnouncementTitle>
                        Read about the over-engineering of my new site!
                        <ArrowUpRightIcon size={16} className="shrink-0 text-foreground/70" />
                    </AnnouncementTitle>
                </Announcement>
                <button
                    onClick={handleClose}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/5 rounded-full transition-colors"
                    aria-label="Close announcement"
                    type="button"
                >
                    <XIcon size={14} className="text-foreground/60" />
                </button>
            </div>
        </div>
    );
}


