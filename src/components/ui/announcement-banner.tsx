'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState
} from 'react'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline: 'text-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
)

type TBadgeProps = React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: TBadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

type TBadgeContext = { themed: boolean }

const BadgeContext = createContext<TBadgeContext>({ themed: false })

function useBadgeContext() {
	const context = useContext(BadgeContext)
	if (!context) {
		throw new Error('useBadgeContext must be used within a Badge')
	}
	return context
}

type TAnnouncementProps = TBadgeProps & { themed?: boolean }

export function Announcement({
	variant = 'outline',
	themed = false,
	className,
	...props
}: TAnnouncementProps) {
	return (
		<BadgeContext.Provider value={{ themed }}>
			<Badge
				variant={variant}
				className={cn(
					'max-w-full gap-2 rounded-full bg-background px-3 py-0.5 font-medium shadow-sm transition-all hover:shadow-md',
					themed && 'border-foreground/5',
					className
				)}
				{...props}
			/>
		</BadgeContext.Provider>
	)
}

type TAnnouncementTagProps = React.HTMLAttributes<HTMLDivElement>

export function AnnouncementTag({
	className,
	...props
}: TAnnouncementTagProps) {
	const { themed } = useBadgeContext()
	return (
		<div
			className={cn(
				'-ml-2.5 shrink-0 truncate rounded-full bg-foreground/5 px-2.5 py-1 text-xs',
				themed && 'bg-background/60',
				className
			)}
			{...props}
		/>
	)
}

type TAnnouncementTitleProps = React.HTMLAttributes<HTMLDivElement>

export function AnnouncementTitle({
	className,
	...props
}: TAnnouncementTitleProps) {
	return (
		<div
			className={cn('flex items-center gap-1 py-1 min-w-0', className)}
			{...props}
		/>
	)
}

export function AnnouncementBanner() {
	const [isVisible, setIsVisible] = useState(false)
	const [isHidden, setIsHidden] = useState(false)
	const [hasScrolledAway, setHasScrolledAway] = useState(false)
	const [dragState, setDragState] = useState({
		isDragging: false,
		startY: 0,
		currentY: 0
	})
	const initialScrollYRef = useRef(0)
	const wrapperRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const dismissed =
			localStorage.getItem('announcement-dismissed') === 'true'
		if (!dismissed) {
			setIsVisible(true)
			initialScrollYRef.current = window.scrollY
		}
	}, [])

	useEffect(() => {
		if (!isVisible) return

		let timeoutId: NodeJS.Timeout
		let lastScrollY = window.scrollY

		function onScroll() {
			const currentScrollY = window.scrollY
			const initialY = initialScrollYRef.current

			// Track if scrolling away or back
			if (
				Math.abs(currentScrollY - initialY) >
				Math.abs(lastScrollY - initialY)
			) {
				setHasScrolledAway(true)
			} else if (
				Math.abs(currentScrollY - initialY) <
				Math.abs(lastScrollY - initialY)
			) {
				setHasScrolledAway(false)
			}

			lastScrollY = currentScrollY

			// Hide after threshold
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				const scrolled = Math.abs(currentScrollY - initialY)
				setIsHidden(scrolled > 750)
			}, 16)
		}

		window.addEventListener('scroll', onScroll, { passive: true })
		return () => {
			window.removeEventListener('scroll', onScroll)
			clearTimeout(timeoutId)
		}
	}, [isVisible])

	function handleClose() {
		setIsHidden(true)
		setTimeout(() => {
			setIsVisible(false)
			localStorage.setItem('announcement-dismissed', 'true')
		}, 300)
	}

	function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
		setDragState({ isDragging: true, startY: clientY, currentY: 0 })
	}

	function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
		if (!dragState.isDragging) return
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
		const diff = clientY - dragState.startY
		setDragState(prev => ({ ...prev, currentY: Math.max(0, diff) }))
	}

	function handleDragEnd() {
		if (!dragState.isDragging) return
		if (dragState.currentY > 50) {
			handleClose()
		}
		setDragState({ isDragging: false, startY: 0, currentY: 0 })
	}

	if (!isVisible) return null

	const translateY = isHidden ? 200 : dragState.currentY

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 sm:px-6 pointer-events-none">
			<div
				ref={wrapperRef}
				className={cn(
					'relative mx-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-fit pointer-events-auto transition-all duration-300 ease-out',
					hasScrolledAway && 'scrolled-away'
				)}
				style={{
					transform: hasScrolledAway
						? undefined
						: `translateY(${translateY}px)`,
					opacity: isHidden ? 0 : undefined,
					transition: dragState.isDragging ? 'none' : undefined
				}}
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
					className="group border-border/60 bg-background/80 supports-[backdrop-filter]:backdrop-blur-sm text-foreground cursor-grab active:cursor-grabbing pr-10 shadow-sm shadow-accent/10 w-full"
				>
					<AnnouncementTag className="-ml-1 bg-amber-500/15 text-amber-500 px-2 py-0.5 leading-none text-[10px] sm:text-xs">
						Beta
					</AnnouncementTag>
					<AnnouncementTitle className="flex items-center gap-1 truncate py-1 min-w-0">
						<span className="truncate text-xs sm:text-sm">
							New site in beta · expect some rough edges!
						</span>
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
