'use client'

import {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
	type PointerEvent
} from 'react'
import * as m from 'motion/react-m'
import { AnimatePresence, PanInfo } from 'motion/react'
import {
	Music,
	GitCommit,
	GitPullRequest,
	Eye,
	Box,
	GitBranch,
	Globe
} from 'lucide-react'
import { AnimatedStarIcon } from '@/components/animated-icons/icons/star'
import { AnimatedAlertCircleIcon } from '@/components/animated-icons/icons/alert-circle'
import { AnimatedCopyIcon } from '@/components/animated-icons/icons/copy'
import { AnimatedPlusIcon } from '@/components/animated-icons/icons/plus'
import { AnimatedLockIcon } from '@/components/animated-icons/icons/lock'
import type { GitHubEventDetail } from '@/features/github/types'
import type { ActivityData } from '@/features/activity/types'
import { EmptyState } from '@/components/home/empty-state/empty-state'
import { ActivityIllustration } from '@/components/home/empty-state/illustrations'
import { ProjectHoverWrapper, SpotifyHoverWrapper } from './hover-wrappers'
import { useInView } from '@/hooks/use-in-view'
import { useSpotifyPlayback } from '@/hooks/use-spotify-playback'
import type { SpotifyTrack } from '@/features/spotify/client'

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const SPOTIFY_TRACKS_CACHE_KEY = 'activity-feed:spotify-tracks'

// Sentence variants for automatic transitions with stagger
const sentenceVariants = {
	initial: { opacity: 0 },
	animate: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.1
		}
	},
	exit: {
		opacity: 0,
		transition: {
			staggerChildren: 0.04,
			staggerDirection: -1
		}
	}
}

// Directional variants for manual slide transitions
const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 300 : -300,
		opacity: 0,
		scale: 0.95
	}),
	center: {
		zIndex: 1,
		x: 0,
		opacity: 1,
		scale: 1,
		transition: {
			x: { type: 'spring' as const, stiffness: 300, damping: 30 },
			opacity: { duration: 0.2 },
			scale: { duration: 0.2 }
		}
	},
	exit: (direction: number) => ({
		zIndex: 0,
		x: direction < 0 ? 300 : -300,
		opacity: 0,
		scale: 0.95,
		transition: {
			x: { type: 'spring' as const, stiffness: 300, damping: 30 },
			opacity: { duration: 0.2 },
			scale: { duration: 0.2 }
		}
	})
}

const wordVariants = {
	initial: {
		y: 20,
		opacity: 0
	},
	animate: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: SMOOTH_EASE
		}
	},
	exit: {
		y: -10,
		opacity: 0,
		transition: {
			duration: 0.2,
			ease: SMOOTH_EASE
		}
	}
}

const highlightVariants = {
	initial: {
		y: 24,
		opacity: 0,
		scale: 0.9
	},
	animate: {
		y: 0,
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.3,
			ease: SMOOTH_EASE
		}
	},
	exit: {
		y: -12,
		opacity: 0,
		scale: 0.95,
		transition: {
			duration: 0.25,
			ease: SMOOTH_EASE
		}
	}
}

function getEventIcon(type: GitHubEventDetail['type']) {
	switch (type) {
		case 'commit':
			return <GitCommit className="size-3" />
		case 'pr':
			return <GitPullRequest className="size-3" />
		case 'issue':
			return <AnimatedAlertCircleIcon className="size-3" />
		case 'review':
			return <Eye className="size-3" />
		case 'release':
			return <Box className="size-3" />
		case 'fork':
			return <AnimatedCopyIcon className="size-3" />
		case 'star':
			return <AnimatedStarIcon className="size-3" />
		case 'create':
			return <AnimatedPlusIcon className="size-3" />
		case 'delete':
			return <GitBranch className="size-3 opacity-70" />
		default:
			return <GitBranch className="size-3" />
	}
}

type ActivityGrammar = {
	prefix: string
	repoToEventConnector?: string
	showEventBadge: boolean
}

const ACTIVITY_GRAMMAR: Record<string, ActivityGrammar[]> = {
	commit: [
		{
			prefix: 'Pushing updates in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Engineering in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Working in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Committing to',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	pr: [
		{
			prefix: 'Pull request in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Proposing changes in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Integrating code in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	create: [
		{
			prefix: 'Setting up in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Branching out in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Starting work in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	review: [
		{
			prefix: 'Reviewing code in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Evaluating changes in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Checking PR in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	issue: [
		{
			prefix: 'Tracking a bug in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Discussing an issue in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Troubleshooting in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	star: [
		{ prefix: 'Starred repository', showEventBadge: false },
		{ prefix: 'Bookmarked', showEventBadge: false }
	],
	fork: [{ prefix: 'Forked repository', showEventBadge: false }],
	release: [
		{
			prefix: 'Shipping release in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Deploying version in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Tagging release in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	delete: [
		{
			prefix: 'Cleaning up in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Pruning branches in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Removing items in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	],
	default: [
		{
			prefix: 'Activity in',
			repoToEventConnector: '→',
			showEventBadge: true
		},
		{
			prefix: 'Working in',
			repoToEventConnector: '→',
			showEventBadge: true
		}
	]
}

function getActivityGrammar(
	type: GitHubEventDetail['type'],
	seed: number,
	title: string
): ActivityGrammar {
	const phrases = ACTIVITY_GRAMMAR[type] || ACTIVITY_GRAMMAR.default
	if (type === 'star' || type === 'fork') {
		return { ...phrases[seed % phrases.length], showEventBadge: false }
	}
	if (!title || title.trim().length === 0) {
		return { ...phrases[seed % phrases.length], showEventBadge: false }
	}
	return phrases[seed % phrases.length]
}

// The manual-slide variant lives inside a Framer Motion `drag="x"` container.
// The drag recognizer listens for pointerdown on that container, so a click on a
// nested link is treated as the start of a (zero-distance) drag and the link never
// navigates. Stopping the pointerdown during the capture phase keeps it from ever
// reaching the drag listener, so the anchor behaves like a normal link while swipe
// navigation on the rest of the card is unaffected.
function stopDragPropagation(event: PointerEvent<HTMLAnchorElement>) {
	event.stopPropagation()
}

function getShortRepoName(fullName: string) {
	return fullName?.split('/').pop() || fullName
}

function formatRelativeTime(dateString: string): string {
	const now = new Date()
	const date = new Date(dateString)
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / (1000 * 60))
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffMins < 1) return 'just now'
	if (diffMins === 1) return 'one minute ago'
	if (diffMins < 30) return `${diffMins} minutes ago`
	if (diffMins < 45) return 'half an hour ago'
	if (diffMins < 60) return '45 minutes ago'
	if (diffHours === 1) return 'one hour ago'
	if (diffHours < 12) return `${diffHours}h ago`
	if (diffHours < 24) return 'half a day ago'
	if (diffDays === 1) return 'yesterday'
	if (diffDays < 7) return `${diffDays} days ago`
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Equalizer({ className = '' }: { className?: string }) {
	return (
		<span
			className={`inline-flex items-end gap-[2px] h-3 mx-1 ${className}`}
			aria-hidden="true"
		>
			<span className="w-[2px] bg-brand-500 rounded-none animate-[music-bar_0.8s_ease-in-out_infinite]" />
			<span className="w-[2px] bg-brand-500 rounded-none animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]" />
			<span className="w-[2px] bg-brand-500 rounded-none animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]" />
		</span>
	)
}

function formatTrackTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface LiveGlowProps {
	progress: number
	currentMs: number
	durationMs: number
}

function LiveGlow({ progress, currentMs, durationMs }: LiveGlowProps) {
	return (
		<m.div
			className="pt-3 pointer-events-none"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<div className="relative flex justify-between h-4 text-[10px] font-mono tabular-nums select-none">
				<span className="text-muted-foreground/80">0:00</span>
				<m.div
					className="absolute top-0 -translate-x-1/2 text-brand-400 whitespace-nowrap"
					style={{ left: `${progress}%` }}
				>
					{formatTrackTime(currentMs)}
				</m.div>
				<span className="text-muted-foreground/80">
					{formatTrackTime(durationMs)}
				</span>
			</div>
			<div className="relative h-[2px]">
				<div className="absolute inset-0 bg-white/5 w-full" />
				<m.div
					className="absolute inset-y-0 left-0 bg-brand-500/80 shadow-[0_0_8px_hsl(var(--brand-500)/0.4)]"
					style={{ width: `${progress}%` }}
					layout
				/>
				<m.div
					className="absolute inset-y-0 bg-brand-400 blur-[2px]"
					animate={{
						opacity: [0.4, 1, 0.4],
						left: `${progress}%`
					}}
					style={{
						width: '4px',
						marginLeft: '-2px'
					}}
					transition={{
						opacity: {
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut'
						},
						left: { duration: 0.1 }
					}}
				/>
			</div>
		</m.div>
	)
}

interface ActivityFeedProps {
	data: ActivityData
	activityCount?: number
	rotationInterval?: number
}

const placeholder =
	'animate-pulse rounded-[4px] bg-foreground/[0.06] text-transparent select-none'
const pillPlaceholder = `inline-flex items-center gap-1.5 px-2 py-0.5 border border-transparent shrink-0 ${placeholder}`

export function ActivityFeedSkeleton() {
	return (
		<div
			className="relative overflow-hidden rounded-none border border-b-0 border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm"
			aria-hidden="true"
		>
			<div className="absolute top-0 left-0 w-full h-px bg-border/10" />

			<div className="relative z-10 px-4 pt-4 pb-3 md:px-6">
				<div className="text-[13px] leading-relaxed space-y-2">
					<div className="relative flex items-center gap-1.5 min-w-0 pr-24">
						<span className={`shrink-0 ${placeholder}`}>
							Pushed to
						</span>
						<span className={pillPlaceholder}>
							<span className="size-3 shrink-0" />
							<span className="font-medium text-[12px]">
								repository
							</span>
						</span>
						<span
							className={`min-w-0 shrink truncate ${pillPlaceholder}`}
						>
							<span className="size-3 shrink-0" />
							<span className="font-medium text-[12px] truncate">
								Recent commit message
							</span>
						</span>
						<span className={`text-[11px] shrink-0 ${placeholder}`}>
							· 2h ago
						</span>
						<div className="absolute right-0 top-0 sm:relative sm:right-auto sm:top-auto flex items-center gap-1 text-muted-foreground/20 shrink-0 ml-auto">
							<span className="p-1">
								<span className="block size-3" />
							</span>
							<span className="text-[10px] font-mono tabular-nums">
								1 / 5
							</span>
							<span className="p-1">
								<span className="block size-3" />
							</span>
						</div>
					</div>

					<div className="flex items-center gap-1.5 min-w-0 border-t border-border/30 pt-2">
						<span className="flex items-center gap-1 text-muted-foreground/60 text-[12px] shrink-0 whitespace-nowrap">
							<Music className="size-4 shrink-0" />
							Whilst listening to
						</span>
						<span className={`gap-1 ${pillPlaceholder}`}>
							<span className="font-semibold text-[12px]">
								Track name by artist
							</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export function ActivityFeed({
	data,
	activityCount = 5,
	rotationInterval = 6000
}: ActivityFeedProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [direction, setDirection] = useState(0) // -1 left, 1 right
	const [isPaused, setIsPaused] = useState(false)
	const [elapsedTime, setElapsedTime] = useState(0)

	const [transitionType, setTransitionType] = useState<'auto' | 'manual'>(
		'auto'
	)

	const activities = data.recentActivity
	const [cachedTracks, setCachedTracks] = useState<SpotifyTrack[]>([])
	const liveTracks = data.spotifyTracks
	const tracks = liveTracks.length > 0 ? liveTracks : cachedTracks

	const rootRef = useRef<HTMLDivElement>(null)
	const inView = useInView(rootRef, '200px')
	const playbackState = useSpotifyPlayback(inView)

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(SPOTIFY_TRACKS_CACHE_KEY)
			if (!raw) return

			const parsed = JSON.parse(raw)
			if (Array.isArray(parsed) && parsed.length > 0) {
				setCachedTracks(parsed)
			}
		} catch {
			window.localStorage.removeItem(SPOTIFY_TRACKS_CACHE_KEY)
		}
	}, [])

	useEffect(() => {
		if (liveTracks.length === 0) return

		setCachedTracks(liveTracks)
		window.localStorage.setItem(
			SPOTIFY_TRACKS_CACHE_KEY,
			JSON.stringify(liveTracks)
		)
	}, [liveTracks])

	const isRealTimePlaying = useMemo(
		() => playbackState.isPlaying && playbackState.track,
		[playbackState.isPlaying, playbackState.track]
	)

	// Keep a deterministic 5-track rotation:
	// - if live: [now playing, ...last 4 recent tracks] (deduped)
	// - otherwise: last 5 recent tracks
	const rotatingTracks = useMemo(() => {
		const recent = tracks.slice(0, activityCount)
		if (!isRealTimePlaying || !playbackState.track) return recent

		const live = playbackState.track
		const dedupedRecent = recent.filter(track => track.id !== live.id)
		return [live, ...dedupedRecent].slice(0, activityCount)
	}, [tracks, activityCount, isRealTimePlaying, playbackState.track])

	// Pair each activity with exactly one track (when available).
	const pairedContent = useMemo(
		() =>
			activities.slice(0, activityCount).map((activity, index) => ({
				activity,
				track:
					rotatingTracks.length > 0
						? rotatingTracks[index % rotatingTracks.length]
						: undefined
			})),
		[activities, rotatingTracks, activityCount]
	)

	const rotateActivity = useCallback(() => {
		if (pairedContent.length === 0 || isPaused) return
		setTransitionType('auto')
		setDirection(1)
		setCurrentIndex(prev => (prev + 1) % pairedContent.length)
		setElapsedTime(0)
	}, [pairedContent.length, isPaused])

	const goToNextSlide = useCallback(() => {
		if (pairedContent.length === 0) return
		setTransitionType('manual')
		setDirection(1)
		setCurrentIndex(prev => (prev + 1) % pairedContent.length)
		setElapsedTime(0)
	}, [pairedContent.length])

	const goToPrevSlide = useCallback(() => {
		if (pairedContent.length === 0) return
		setTransitionType('manual')
		setDirection(-1)
		setCurrentIndex(
			prev => (prev - 1 + pairedContent.length) % pairedContent.length
		)
		setElapsedTime(0)
	}, [pairedContent.length])

	const handleDragEnd = (info: PanInfo) => {
		const offset = info.offset.x
		const velocity = info.velocity.x
		const width = 100 // threshold

		if (offset < -width || velocity < -500) {
			setTransitionType('manual')
			goToNextSlide()
		} else if (offset > width || velocity > 500) {
			setTransitionType('manual')
			goToPrevSlide()
		}
	}

	useEffect(() => {
		if (pairedContent.length === 0 || !inView) return

		const interval = setInterval(() => {
			if (!isPaused) {
				setElapsedTime(prev => {
					const newTime = prev + 100
					if (newTime >= rotationInterval) {
						rotateActivity()
						return 0
					}
					return newTime
				})
			}
		}, 100)

		return () => clearInterval(interval)
	}, [
		pairedContent.length,
		inView,
		isPaused,
		rotationInterval,
		rotateActivity
	])

	useEffect(() => {
		setElapsedTime(0)
	}, [currentIndex])

	const totalSlides = pairedContent.length

	const currentContent = useMemo(
		() =>
			totalSlides > 0
				? pairedContent[currentIndex % totalSlides]
				: undefined,
		[pairedContent, currentIndex, totalSlides]
	)

	const currentActivity = currentContent?.activity
	const currentTrack = currentContent?.track

	const displayTrack = currentTrack

	const isCurrentTrackLive = useMemo(
		() =>
			!!displayTrack &&
			!!playbackState.track &&
			isRealTimePlaying &&
			displayTrack.id === playbackState.track.id,
		[displayTrack, playbackState.track, isRealTimePlaying]
	)

	if (!currentActivity) {
		return (
			<div className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm">
				<EmptyState
					title="No recent activity"
					description="Commits and listening history show up here once they come in."
					illustration={<ActivityIllustration loop />}
					headingLevel="h3"
					link={{
						label: 'Empty state from my UI resources',
						href: '/packages/empty-states?component=activity#component'
					}}
				/>
			</div>
		)
	}

	const repoName = getShortRepoName(currentActivity.repository)
	const grammar = getActivityGrammar(
		currentActivity.type,
		currentIndex,
		currentActivity.title
	)
	const isPrivate = currentActivity.isPrivate

	return (
		<m.div
			ref={rootRef}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onFocus={() => setIsPaused(true)}
			onBlur={() => setIsPaused(false)}
			className="relative overflow-hidden rounded-none border border-b-0 border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing touch-pan-y"
			role="region"
			aria-label="Recent activity feed showing GitHub contributions and Spotify listening history"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

			<div className="absolute top-0 left-0 w-full h-px bg-border/10">
				<m.div
					className="h-full bg-foreground/20"
					animate={{
						width: `${(elapsedTime / rotationInterval) * 100}%`
					}}
					transition={{ duration: 0.1, ease: 'linear' }}
				/>
			</div>

			<div
				className="relative z-10 px-4 pt-4 pb-3 md:px-6"
				aria-live="polite"
				aria-atomic="true"
			>
				<AnimatePresence
					mode={transitionType === 'auto' ? 'wait' : 'popLayout'}
					custom={direction}
					initial={false}
				>
					{transitionType === 'auto' ? (
						<m.div
							key={`${currentIndex}-${currentActivity.id}`}
							variants={sentenceVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							className="text-[13px] leading-relaxed space-y-2"
						>
							{/* GITHUB ROW - Single line, no wrapping */}
							<div className="relative flex items-center gap-1.5 min-w-0 pr-24">
								<m.span
									variants={wordVariants}
									className="text-muted-foreground/70 shrink-0"
								>
									{grammar.prefix}
								</m.span>

								<m.span
									variants={highlightVariants}
									className="shrink-0"
								>
									<ProjectHoverWrapper
										repository={currentActivity.repository}
										isPrivate={isPrivate}
									>
										{isPrivate ? (
											<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/5 text-amber-500 border border-amber-500/20 rounded-[4px] cursor-pointer transition-colors group shrink-0">
												<AnimatedLockIcon className="size-3 opacity-70 shrink-0" />
												<span className="font-medium text-[12px] truncate">
													{repoName}
												</span>
											</span>
										) : (
											<a
												href={currentActivity.url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded-[4px] transition-colors cursor-pointer group shrink-0 focus-visible:outline-none focus-visible:bg-primary/15 focus-visible:border-primary/50"
											>
												<GitBranch className="size-3 opacity-70 shrink-0" />
												<span className="font-medium text-[12px] truncate">
													{repoName}
												</span>
											</a>
										)}
									</ProjectHoverWrapper>
								</m.span>

								{grammar.repoToEventConnector &&
									grammar.showEventBadge && (
										<m.span
											variants={wordVariants}
											className="text-muted-foreground/50 shrink-0"
										>
											{grammar.repoToEventConnector}
										</m.span>
									)}

								{grammar.showEventBadge && (
									<m.span
										variants={highlightVariants}
										className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted/40 border border-border/40 rounded-[4px] min-w-0 shrink"
									>
										<span className="opacity-60 shrink-0">
											{getEventIcon(currentActivity.type)}
										</span>
										<span className="font-medium text-[12px] text-foreground/80 truncate">
											{currentActivity.title}
										</span>
									</m.span>
								)}

								<m.span
									variants={wordVariants}
									className="text-muted-foreground/40 text-[11px] shrink-0"
								>
									·{' '}
									{formatRelativeTime(
										currentActivity.timestamp
									)}
								</m.span>

								{/* NAVIGATION ARROWS - Positioned absolutely for desktop, inline for mobile */}
								<div className="absolute right-0 top-0 sm:relative sm:right-auto sm:top-auto flex items-center gap-1 text-muted-foreground/40 shrink-0 ml-auto">
									<button
										onClick={goToPrevSlide}
										className="p-1 rounded-sm hover:text-foreground transition-colors focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
										aria-label="Previous slide"
									>
										<svg
											className="size-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>
									<span className="text-[10px] font-mono tabular-nums">
										{(currentIndex % totalSlides) + 1} /{' '}
										{totalSlides}
									</span>
									<button
										onClick={goToNextSlide}
										className="p-1 rounded-sm hover:text-foreground transition-colors focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
										aria-label="Next slide"
									>
										<svg
											className="size-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* SPOTIFY ROW - Single line, no wrapping */}
							<div className="flex items-center gap-1.5 min-w-0 border-t border-border/30 pt-2">
								<m.span
									variants={wordVariants}
									className="flex items-center gap-1 text-muted-foreground/60 text-[12px] shrink-0 whitespace-nowrap"
								>
									<Music className="size-4 shrink-0" />
									Whilst listening to
								</m.span>

								{displayTrack ? (
									<>
										<SpotifyHoverWrapper
											track={displayTrack}
											isPlaying={isCurrentTrackLive}
										>
											<m.a
												variants={highlightVariants}
												href={displayTrack.url}
												target="_blank"
												rel="noopener noreferrer"
												className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] font-medium text-[12px] transition-colors cursor-pointer min-w-0 shrink focus-visible:outline-none ${
													isCurrentTrackLive
														? 'bg-brand-500/5 text-brand-500 border border-brand-500/20 focus-visible:bg-brand-500/15 focus-visible:border-brand-500/50'
														: 'bg-muted/40 text-foreground/80 border border-border/40 focus-visible:bg-muted focus-visible:text-foreground focus-visible:border-border'
												}`}
											>
												{isCurrentTrackLive && (
													<Equalizer />
												)}
												<span className="font-semibold truncate">
													{displayTrack.name}
												</span>
											</m.a>
										</SpotifyHoverWrapper>

										<m.span
											variants={wordVariants}
											className="text-muted-foreground/50 shrink-0 whitespace-nowrap"
										>
											by
										</m.span>

										<m.span
											variants={highlightVariants}
											className="text-foreground/70 font-medium text-[12px] truncate min-w-0"
										>
											{displayTrack.artist}
										</m.span>
									</>
								) : (
									<m.span
										variants={wordVariants}
										className="text-muted-foreground/50 italic text-[12px]"
									>
										Coding in silence
									</m.span>
								)}
							</div>
						</m.div>
					) : (
						// MANUAL SLIDE VARIANT (Simplified for brevity as structure mirrors above, but usually kept in sync)
						<m.div
							key={`${currentIndex}-${currentActivity.id}`}
							custom={direction}
							variants={slideVariants}
							initial="enter"
							animate="center"
							exit="exit"
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							dragElastic={0.2}
							onDragEnd={(_, info) => handleDragEnd(info)}
							className="text-[13px] leading-relaxed space-y-2"
						>
							{/* Single-line GitHub activity - no wrapping */}
							<div className="flex items-center gap-1.5 min-w-0 pr-8">
								<span className="text-muted-foreground/80 font-normal shrink-0">
									{grammar.prefix}
								</span>

								<ProjectHoverWrapper
									repository={currentActivity.repository}
									isPrivate={isPrivate}
								>
									{isPrivate ? (
										<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/5 text-amber-500 font-medium border border-amber-500/20 rounded-[4px] text-[12px] shrink-0">
											<AnimatedLockIcon className="size-3 shrink-0" />
											<span className="truncate">
												{repoName}
											</span>
										</span>
									) : (
										<a
											href={currentActivity.url}
											target="_blank"
											rel="noopener noreferrer"
											onPointerDownCapture={
												stopDragPropagation
											}
											className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary font-medium border border-primary/20 rounded-[4px] text-[12px] shrink-0 transition-colors focus-visible:outline-none focus-visible:bg-primary/15 focus-visible:border-primary/50"
										>
											<Globe className="size-3 shrink-0" />
											<span className="truncate">
												{repoName}
											</span>
										</a>
									)}
								</ProjectHoverWrapper>

								{grammar.repoToEventConnector &&
									grammar.showEventBadge && (
										<span className="text-muted-foreground/60 font-light italic text-[12px] shrink-0">
											{grammar.repoToEventConnector}
										</span>
									)}

								{grammar.showEventBadge && (
									<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted/40 border border-border/40 rounded-[4px] text-foreground/90 font-medium min-w-0 shrink">
										<span className="opacity-70 shrink-0">
											{getEventIcon(currentActivity.type)}
										</span>
										<span className="truncate text-[12px]">
											{currentActivity.title}
										</span>
									</span>
								)}

								<span className="inline-flex items-center gap-1 text-muted-foreground/40 text-[11px] shrink-0">
									<span className="w-0.5 h-0.5 rounded-full bg-current" />
									<time dateTime={currentActivity.timestamp}>
										{formatRelativeTime(
											currentActivity.timestamp
										)}
									</time>
								</span>
							</div>

							{/* Single-line Spotify activity - no wrapping */}
							<div className="flex items-center gap-1.5 min-w-0 border-t border-border/40 pt-2">
								{displayTrack ? (
									<>
										<span className="flex items-center gap-1 text-muted-foreground/70 text-[12px] shrink-0 whitespace-nowrap">
											<Music className="size-3.5 shrink-0" />
											Listening to
										</span>

										<SpotifyHoverWrapper
											track={displayTrack}
											isPlaying={isCurrentTrackLive}
										>
											<a
												href={displayTrack.url}
												target="_blank"
												rel="noopener noreferrer"
												onPointerDownCapture={
													stopDragPropagation
												}
												className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] font-medium text-[12px] transition-colors min-w-0 shrink focus-visible:outline-none ${
													isCurrentTrackLive
														? 'bg-brand-500/5 text-brand-500 border border-brand-500/20 focus-visible:bg-brand-500/15 focus-visible:border-brand-500/50'
														: 'bg-muted/40 text-foreground/80 border border-border/40 focus-visible:bg-muted focus-visible:text-foreground focus-visible:border-border'
												}`}
											>
												{isCurrentTrackLive && (
													<span className="inline-flex items-center gap-1 px-1 py-0 bg-brand-500/10 border border-brand-500/20 rounded-[2px] ml-0">
														<span className="w-1 h-1 rounded-full bg-brand-500 animate-pulse" />
														<span className="text-[10px] font-bold text-brand-500 whitespace-nowrap">
															LIVE
														</span>
													</span>
												)}
												<span className="truncate font-semibold min-w-0">
													{displayTrack.name}
												</span>
												<span className="text-muted-foreground/40 font-light shrink-0 whitespace-nowrap">
													by
												</span>
												<span
													className={`truncate min-w-0 ${isCurrentTrackLive ? 'text-brand-400' : 'text-foreground/70'}`}
												>
													{displayTrack.artist}
												</span>
											</a>
										</SpotifyHoverWrapper>
									</>
								) : (
									<span className="flex items-center gap-1 text-muted-foreground/50 italic text-[12px] shrink-0 whitespace-nowrap">
										<Music className="size-3.5 shrink-0" />
										Coding in silence
									</span>
								)}
							</div>
						</m.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{isCurrentTrackLive && (
						<LiveGlow
							progress={playbackState.percentage}
							currentMs={playbackState.progress}
							durationMs={playbackState.duration}
						/>
					)}
				</AnimatePresence>
			</div>
		</m.div>
	)
}
