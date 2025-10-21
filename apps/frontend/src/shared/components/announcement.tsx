"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ArrowUpRightIcon, XIcon } from "lucide-react"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
)

type TBadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: TBadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

type TBadgeContext = { themed: boolean }

const BadgeContext = React.createContext<TBadgeContext>({ themed: false })

function useBadgeContext() {
    const context = React.useContext(BadgeContext)
    if (!context) {
        throw new Error("useBadgeContext must be used within a Badge")
    }
    return context
}

type TAnnouncementProps = TBadgeProps & { themed?: boolean }

export function Announcement({ variant = "outline", themed = false, className, ...props }: TAnnouncementProps) {
    return (
        <BadgeContext.Provider value={{ themed }}>
            <Badge
                variant={variant}
                className={cn(
                    "max-w-full gap-2 rounded-full bg-background px-3 py-0.5 font-medium shadow-sm transition-all hover:shadow-md",
                    themed && "border-foreground/5",
                    className,
                )}
                {...props}
            />
        </BadgeContext.Provider>
    )
}

type TAnnouncementTagProps = React.HTMLAttributes<HTMLDivElement>

export function AnnouncementTag({ className, ...props }: TAnnouncementTagProps) {
    const { themed } = useBadgeContext()
    return (
        <div
            className={cn(
                "-ml-2.5 shrink-0 truncate rounded-full bg-foreground/5 px-2.5 py-1 text-xs",
                themed && "bg-background/60",
                className,
            )}
            {...props}
        />
    )
}

type TAnnouncementTitleProps = React.HTMLAttributes<HTMLDivElement>

export function AnnouncementTitle({ className, ...props }: TAnnouncementTitleProps) {
    return <div className={cn("flex items-center gap-1 py-1 min-w-0", className)} {...props} />
}

export function AnnouncementBanner() {
    const [isVisible, setIsVisible] = React.useState(false)
    const [shouldAnimateIn, setShouldAnimateIn] = React.useState(false)
    const [isDragging, setIsDragging] = React.useState(false)
    const [dragY, setDragY] = React.useState(0)
    const [startY, setStartY] = React.useState(0)
    const [isHiddenByScroll, setIsHiddenByScroll] = React.useState(false)
    const [shouldHideByScroll, setShouldHideByScroll] = React.useState(false)
    const [isClosing, setIsClosing] = React.useState(false)
    const lastScrollYRef = React.useRef(0)
    const wrapperRef = React.useRef<HTMLDivElement | null>(null)
    const [bannerHeight, setBannerHeight] = React.useState(80)
    const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(function init() {
        const dismissed = typeof window !== "undefined" && window.localStorage.getItem("announcement-dismissed") === "true"
        if (!dismissed) {
            setIsVisible(true)
            // Delay the animation to create a smooth entrance
            setTimeout(() => setShouldAnimateIn(true), 100)
        }
    }, [])

    React.useEffect(function attachScrollListener() {
        function onScroll() {
            const currentY = window.scrollY || 0
            const delta = currentY - (lastScrollYRef.current || 0)

            // Log scroll position
            console.log('Announcement scroll position:', {
                scrollY: currentY,
                delta: delta,
                direction: delta > 0 ? 'down' : delta < 0 ? 'up' : 'none',
                timestamp: new Date().toISOString()
            })

            // Clear any existing timeout
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }

            // Debounce the scroll state change to prevent flickering
            scrollTimeoutRef.current = setTimeout(() => {
                // Hide when scrolling down more than 50px
                if (currentY > 50 && delta > 3) {
                    setIsHiddenByScroll(true)
                    setShouldHideByScroll(true)
                }
                // Show when scrolling up or near the top
                else if (delta < -3 || currentY <= 50) {
                    setIsHiddenByScroll(false)
                    // Delay showing for smooth animation
                    setTimeout(() => setShouldHideByScroll(false), 50)
                }
            }, 30)

            lastScrollYRef.current = currentY
        }

        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", onScroll)
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
        }
    }, [])

    React.useLayoutEffect(
        function measureHeight() {
            if (!wrapperRef.current) return
            const rect = wrapperRef.current.getBoundingClientRect()
            setBannerHeight(rect.height + 24)
        },
        [isVisible],
    )

    function handleClose() {
        setIsClosing(true)
        setDragY(-200)
        window.setTimeout(function hide() {
            setIsVisible(false)
            window.localStorage.setItem("announcement-dismissed", "true")
        }, 300)
    }

    function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
        setIsDragging(true)
        const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
        setStartY(clientY)
    }

    function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
        if (!isDragging) return
        const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
        const diff = clientY - startY
        if (diff < 0) setDragY(diff)
    }

    function handleDragEnd() {
        if (!isDragging) return
        setIsDragging(false)
        if (dragY < -50) handleClose()
        setDragY(0)
    }

    if (!isVisible) return null

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 sm:px-6 pointer-events-none" style={{ contain: 'paint' }}>
            <div
                className="relative mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-fit pointer-events-auto overflow-visible"
                style={{
                    transform: `translateY(${(shouldAnimateIn ? 0 : -bannerHeight - 20) + (shouldHideByScroll ? -bannerHeight - 20 : 0) + dragY}px)`,
                    opacity: shouldAnimateIn && !shouldHideByScroll && !isClosing ? 1 : 0,
                    transition: isDragging ? "none" : `transform ${shouldAnimateIn && !isHiddenByScroll && !isClosing ? "0.8s" : "0.5s"} cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${shouldAnimateIn && !isHiddenByScroll && !isClosing ? "0.6s" : "0.3s"} ease-out`,
                }}
                ref={wrapperRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <Announcement
                    themed
                    className="group border-border/60 bg-background/80 supports-[backdrop-filter]:backdrop-blur-sm text-foreground cursor-grab active:cursor-grabbing pr-10 shadow-sm shadow-accent/10 w-full overflow-hidden"
                >
                    <AnnouncementTag className="-ml-1 bg-accent/15 text-accent px-2 py-0.5 leading-none text-[10px] sm:text-xs">Blog</AnnouncementTag>
                    <AnnouncementTitle className="flex items-center gap-1 truncate py-1 min-w-0">
                        <span className="truncate">Read about the over-engineering of my new site!</span>
                        <ArrowUpRightIcon size={16} className="shrink-0 text-accent/70 group-hover:text-accent transition-colors" />
                    </AnnouncementTitle>
                </Announcement>
                <button
                    onClick={handleClose}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/5 rounded-full transition-colors"
                    aria-label="Close announcement"
                    type="button"
                >
                    <XIcon size={14} className="text-foreground/60" />
                </button>
            </div>
        </div>
    )
}
