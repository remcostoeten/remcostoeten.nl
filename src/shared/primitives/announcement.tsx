"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utilities/cn"
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
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

export type TBadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: TBadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

type TBadgeContext = {
  themed: boolean
  size: "sm" | "md" | "lg"
}

const BadgeContext = React.createContext<TBadgeContext>({
  themed: false,
  size: "md"
})

function useBadgeContext() {
  const context = React.useContext(BadgeContext)
  if (!context) {
    throw new Error("useBadgeContext must be used within a Badge")
  }
  return context
}

export interface Iops extends TBadgeProps {
  themed?: boolean
  size?: "sm" | "md" | "lg"
  showBadge?: boolean
  badgeText?: string
  badgeVariant?: VariantProps<typeof badgeVariants>["variant"]
  showCloseButton?: boolean
  closable?: boolean
  animationDuration?: number
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  maxWidth?: string
  backdrop?: boolean
  draggable?: boolean
  hideOnScroll?: boolean
  scrollThreshold?: number
  id?: string
  role?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}

export function Announcement({
  variant = "outline",
  themed = false,
  size = "md",
  showBadge = true,
  badgeText = "New",
  badgeVariant = "secondary",
  showCloseButton = true,
  closable = true,
  className,
  children,
  id,
  role = "status",
  ariaLabel,
  ariaDescribedBy,
  ...props
}: Iops) {
  const contextValue = React.useMemo(() => ({ themed, size }), [themed, size])

  return (
    <BadgeContext.Provider value={contextValue}>
      <div
        id={id}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={cn(
          // Base layout and sizing
          "relative mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-fit pointer-events-auto overflow-visible",
          "inline-flex items-center border text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "max-w-full gap-2 rounded-full px-3 py-0.5 font-medium transition-all hover:shadow-md",

          // Appearance
          "border-border/60 bg-background/80 supports-backdrop-filter:backdrop-blur-sm text-foreground",
          "shadow-sm shadow-emerald-500/10 w-full overflow-hidden",

          // Interactive states
          "group cursor-grab active:cursor-grabbing pr-10", // Extra padding for close button

          // Size variations
          size === "sm" && "px-2 py-0 text-xs pr-9",
          size === "lg" && "px-4 py-1 text-sm pr-12",

          className
        )}
        {...props}
      >
        {children}
      </div>
    </BadgeContext.Provider>
  )
}

export interface TAnnouncementTagProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof badgeVariants>["variant"]
}

export function AnnouncementTag({ className, variant = "secondary", ...props }: TAnnouncementTagProps) {
  const { themed, size } = useBadgeContext()

  return (
    <div
      className={cn(
        // Base styling
        "shrink-0 truncate rounded-full px-2 py-0.5 font-medium",

        // Position and size
        "-ml-1",
        // Use explicit accent color with fallback
        "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
        "text-[10px] sm:text-xs",

        // Size variations
        size === "sm" && "px-1.5 py-0.5 text-[9px]",
        size === "lg" && "px-2.5 py-0.5 text-xs",

        className
      )}
      {...props}
    />
  )
}

export interface TAnnouncementTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  showIcon?: boolean
  icon?: React.ReactNode
  iconPosition?: "start" | "end"
}

export function AnnouncementTitle({
  className,
  children,
  showIcon = false,
  icon = <ArrowUpRightIcon size={16} />,
  iconPosition = "end",
  ...props
}: TAnnouncementTitleProps) {
  const { size } = useBadgeContext()

  return (
    <div className={cn("flex items-center gap-1 truncate py-1 min-w-0", className)} {...props}>
      {showIcon && iconPosition === "start" && (
        <span className="shrink-0 text-emerald-600/70 dark:text-emerald-400/70 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {icon}
        </span>
      )}
      <span className={cn(
        "truncate",
        size === "sm" && "text-xs",
        size === "lg" && "text-base"
      )}>
        {children}
      </span>
      {showIcon && iconPosition === "end" && (
        <span className="shrink-0 text-emerald-600/70 dark:text-emerald-400/70 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {icon}
        </span>
      )}
    </div>
  )
}

export interface TAnnouncementCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose?: () => void
  icon?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export function AnnouncementClose({
  onClose,
  className,
  icon = <XIcon size={14} />,
  size = "md",
  ...props
}: TAnnouncementCloseProps) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/5 rounded-full transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        size === "sm" && "right-1.5 p-0.5",
        size === "lg" && "right-3 p-1.5",
        className
      )}
      aria-label="Close announcement"
      {...props}
    >
      <span className="text-foreground/60 block">
        {icon}
      </span>
    </button>
  )
}

export interface TAnnouncementBannerProps {
  children: React.ReactNode
  isVisible?: boolean
  animationDuration?: number
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  maxWidth?: string
  backdrop?: boolean
  draggable?: boolean
  hideOnScroll?: boolean
  scrollThreshold?: number
  hideAfterPixels?: number
  showAgain?: 'top' | number
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void
  onDragMove?: (e: React.MouseEvent | React.TouchEvent) => void
  onDragEnd?: () => void
  onClose?: () => void
  className?: string
  id?: string
}

export function AnnouncementBanner({
  children,
  isVisible = true,
  animationDuration = 500,
  position = "top-center",
  maxWidth = "max-w-2xl",
  backdrop = false,
  draggable = false,
  hideOnScroll = false,
  scrollThreshold = 50,
  hideAfterPixels,
  showAgain,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClose,
  className,
  id
}: TAnnouncementBannerProps) {
  const [shouldAnimateIn, setShouldAnimateIn] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragY, setDragY] = React.useState(0)
  const [startY, setStartY] = React.useState(0)
  const [isHiddenByScroll, setIsHiddenByScroll] = React.useState(false)
  const [shouldHideByScroll, setShouldHideByScroll] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const lastScrollYRef = React.useRef(0)
  const isScrolledRef = React.useRef(false)
  const maxScrollYRef = React.useRef(0)
  const hasHiddenByPixelsRef = React.useRef(false)
  const scrollUpStartRef = React.useRef<number | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const [bannerHeight, setBannerHeight] = React.useState(80)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (isVisible) {
      setShouldAnimateIn(true)
    }
  }, [isVisible])

  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0
      const lastY = lastScrollYRef.current

      // Track scroll state for spacing with transition effect
      const newScrolled = currentY > 50
      if (newScrolled !== isScrolledRef.current) {
        setIsTransitioning(true)
        setIsScrolled(newScrolled)
        isScrolledRef.current = newScrolled
        setTimeout(() => setIsTransitioning(false), 600)
      }

      if (!hideOnScroll && !hideAfterPixels) {
        return // Only track scroll state for spacing
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        let shouldHide = false
        let shouldShow = false

        // Original scroll threshold logic
        if (hideOnScroll && currentY > scrollThreshold) {
          shouldHide = true
        } else if (hideOnScroll && currentY <= scrollThreshold) {
          shouldShow = true
        }

        // Hide after scrolling past hideAfterPixels
        if (hideAfterPixels && currentY > hideAfterPixels && !hasHiddenByPixelsRef.current) {
          shouldHide = true
          hasHiddenByPixelsRef.current = true
          scrollUpStartRef.current = null // Reset scroll up tracking
        }

        // Show again logic: if hidden and scrolling up by showAgain pixels from anywhere
        if (hideAfterPixels && hasHiddenByPixelsRef.current) {
          if (showAgain === 'top' && currentY <= 0) {
            shouldShow = true
            hasHiddenByPixelsRef.current = false
            scrollUpStartRef.current = null
          } else if (typeof showAgain === 'number') {
            // Check if scrolling up (current position is less than last position)
            if (currentY < lastY) {
              // Start tracking scroll up position if not already tracking
              if (scrollUpStartRef.current === null) {
                scrollUpStartRef.current = lastY
              }
              
              // Check if we've scrolled up by showAgain pixels from the start position
              const scrollAmountBack = scrollUpStartRef.current - currentY
              if (scrollAmountBack >= showAgain) {
                shouldShow = true
                hasHiddenByPixelsRef.current = false
                scrollUpStartRef.current = null
              }
            } else if (currentY > lastY) {
              // Scrolling down again, reset scroll up tracking
              scrollUpStartRef.current = null
            }
          }
        }

        if (shouldHide) {
          setIsHiddenByScroll(true)
          setShouldHideByScroll(true)
        } else if (shouldShow) {
          setIsHiddenByScroll(false)
          setShouldHideByScroll(false)
        }
      }, 16)

      lastScrollYRef.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial scroll state
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [hideOnScroll, scrollThreshold, hideAfterPixels, showAgain])

  React.useLayoutEffect(() => {
    if (!wrapperRef.current || !isVisible) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setBannerHeight(rect.height + 24)
  }, [isVisible])

  const handleDragStart = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return
    setIsDragging(true)
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    setStartY(clientY)
    onDragStart?.(e)
  }, [draggable, onDragStart])

  const handleDragMove = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggable) return
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const diff = clientY - startY
    if (diff < 0) setDragY(diff)
    onDragMove?.(e)
  }, [isDragging, draggable, startY, onDragMove])

  const handleDragEnd = React.useCallback(() => {
    if (!isDragging || !draggable) return
    setIsDragging(false)
    if (dragY < -50) {
      setIsClosing(true)
      setDragY(-200)
      window.setTimeout(() => {
        onClose?.()
      }, 300)
    } else {
      setDragY(0)
    }
    onDragEnd?.()
  }, [isDragging, draggable, dragY, onClose, onDragEnd])

  if (!isVisible) return null

  const getPositionClasses = () => {
    const topSpacing = isScrolled ? "top-2" : "top-6"
    const positions = {
      "top-left": `${topSpacing} left-6 -translate-x-0 -translate-y-0`,
      "top-center": `${topSpacing} left-1/2 -translate-x-1/2 -translate-y-0`,
      "top-right": `${topSpacing} right-6 -translate-x-0 -translate-y-0`,
      "bottom-left": "bottom-6 left-6 -translate-x-0 -translate-y-0",
      "bottom-center": "bottom-6 left-1/2 -translate-x-1/2 translate-y-0",
      "bottom-right": "bottom-6 right-6 -translate-x-0 -translate-y-0"
    }
    return positions[position]
  }

  return (
    <>
      {backdrop && isVisible && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <div
        id={id}
        className={cn(
          "fixed z-50 w-full px-4 sm:px-6 pointer-events-none",
          getPositionClasses(),
          className
        )}
        style={{
          contain: 'paint',
          transition: "top 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="relative mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-fit pointer-events-auto overflow-visible"
          style={{
            transform: `translateY(${(shouldAnimateIn && !shouldHideByScroll ? 0 : -bannerHeight - 20) + dragY}px)`,
            opacity: shouldAnimateIn && !shouldHideByScroll && !isClosing ? 1 : 0,
            transition: isDragging ? "none" : `transform ${animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${animationDuration * 0.6}ms ease-out`,
            maxWidth: maxWidth === "none" ? "none" : undefined
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
          {children}
        </div>
      </div>
    </>
  )
}