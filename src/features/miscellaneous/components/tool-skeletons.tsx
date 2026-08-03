import type { ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeletons/skeleton'
import type { TToolSlug } from '../constants/tools'

type TIconGroupProps = {
	count: number
	className?: string
	gap?: string
}

function IconGroup({ count, className = 'h-7 w-7', gap = 'gap-0.5' }: TIconGroupProps) {
	return (
		<div className={`flex items-center ${gap}`}>
			{Array.from({ length: count }, (_, i) => (
				<Skeleton key={i} className={className} />
			))}
		</div>
	)
}

function LoadingShell({ children }: { children: React.ReactNode }) {
	return (
		<div role="status" aria-label="Loading tool">
			{children}
		</div>
	)
}

export function FindReplaceSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-1.5">
						<Skeleton className="h-7 w-28 rounded-sm" />
						<IconGroup count={5} />
					</div>
					<div className="flex items-center gap-0.5">
						<IconGroup count={3} />
						<Skeleton className="h-7 w-44" />
						<Skeleton className="h-7 w-24" />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3">
					<div className="flex min-w-0 flex-col gap-3">
						<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
								<div className="grow">
									<Skeleton className="h-9 w-full" />
								</div>
								<div className="flex items-center gap-1">
									<Skeleton className="h-9 w-9" />
									<Skeleton className="h-9 w-9" />
									<div className="ml-1 flex items-center gap-1">
										<IconGroup count={4} className="h-9 w-9" gap="gap-1" />
									</div>
								</div>
							</div>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
								<div className="grow">
									<Skeleton className="h-9 w-full" />
								</div>
								<div className="flex flex-wrap items-center gap-1">
									<Skeleton className="h-9 w-9" />
									<Skeleton className="h-9 w-9" />
									<Skeleton className="h-9 w-24" />
									<Skeleton className="h-9 w-16" />
									<Skeleton className="h-9 w-28" />
								</div>
							</div>
							<div className="min-h-4" />
						</div>

						<div className="flex flex-col border border-border/50 bg-card md:flex-row md:items-stretch">
							<section className="relative flex min-w-0 flex-col md:basis-1/2">
								<header className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
									<Skeleton className="h-4 w-12" />
									<IconGroup count={4} />
								</header>
								<div className="relative h-72 grow p-3 md:h-96">
									<Skeleton className="h-full w-full rounded-none" />
								</div>
								<footer className="flex items-center justify-between border-t border-border/50 px-3 py-1">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-16" />
								</footer>
							</section>
							<div className="hidden w-1 shrink-0 bg-border/50 md:block" />
							<section className="flex min-w-0 flex-col border-t border-border/50 md:basis-1/2 md:border-t-0">
								<header className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
									<Skeleton className="h-4 w-16" />
									<IconGroup count={4} />
								</header>
								<div className="relative h-72 grow p-3 md:h-96">
									<Skeleton className="h-full w-full rounded-none" />
								</div>
								<footer className="flex items-center justify-between border-t border-border/50 px-3 py-1">
									<Skeleton className="h-4 w-32" />
								</footer>
							</section>
						</div>
					</div>
				</div>

				<Skeleton className="h-7 w-36" />
				<Skeleton className="h-7 w-44" />
			</div>
		</LoadingShell>
	)
}

export function DiffCheckerSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-end gap-1">
					<Skeleton className="h-7 w-28" />
					<Skeleton className="h-7 w-20" />
				</div>

				<div className="grid grid-cols-1 divide-y divide-border/50 border border-border/50 bg-card md:grid-cols-2 md:divide-x md:divide-y-0">
					{[0, 1].map(i => (
						<section key={i} className="relative flex min-w-0 flex-col">
							<header className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
								<Skeleton className="h-4 w-20" />
								<IconGroup count={4} />
							</header>
							<div className="relative h-64 grow p-3 md:h-80">
								<Skeleton className="h-full w-full rounded-none" />
							</div>
							<footer className="flex items-center justify-between border-t border-border/50 px-3 py-1">
								<Skeleton className="h-4 w-32" />
							</footer>
						</section>
					))}
				</div>

				<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<Skeleton className="h-4 w-80 max-w-full" />
						<div className="flex items-center gap-1">
							<Skeleton className="mr-1 h-8 w-36 rounded-md" />
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-24" />
						</div>
					</div>
					<div className="border border-border/50 bg-background/50 px-3 py-8">
						<Skeleton className="mx-auto h-4 w-48" />
					</div>
				</div>
			</div>
		</LoadingShell>
	)
}

function LinkExtractorSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<section className="flex flex-col gap-2 border border-border/50 bg-card p-3">
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-7 w-full max-w-64 rounded-md" />
						<Skeleton className="h-8 w-56 rounded-md" />
						<Skeleton className="h-7 w-10 rounded-md" />
						<Skeleton className="h-7 w-10 rounded-md" />
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-8 w-56 rounded-md" />
						<Skeleton className="h-7 w-32 rounded-md" />
						<Skeleton className="h-7 w-28 rounded-md" />
						<Skeleton className="h-7 w-28 rounded-md" />
					</div>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<Skeleton className="h-8 w-80 max-w-full rounded-md" />
						<Skeleton className="h-7 w-28" />
					</div>
					<div className="min-h-4" />
				</section>

				<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
					<section className="flex min-w-0 flex-col border border-border/50 bg-card">
						<header className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
							<Skeleton className="h-4 w-28" />
							<IconGroup count={2} />
						</header>
						<div className="h-[26rem] w-full p-2">
							<Skeleton className="h-full w-full rounded-none" />
						</div>
						<footer className="flex h-9 items-center border-t border-border/50 px-2">
							<Skeleton className="h-4 w-64 max-w-full" />
						</footer>
					</section>

					<section className="flex min-w-0 flex-col border border-border/50 bg-card">
						<header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-2 py-1.5">
							<Skeleton className="h-4 w-44" />
							<IconGroup count={2} />
						</header>
						<div className="border-b border-border/50 px-2 py-1.5">
							<div className="flex flex-wrap items-center gap-1.5">
								<Skeleton className="h-7 w-16 rounded-md" />
								<Skeleton className="h-7 w-32" />
								<Skeleton className="h-7 w-28" />
								<Skeleton className="h-7 w-32" />
							</div>
						</div>
						<div className="h-[26rem] overflow-hidden p-2">
							<Skeleton className="h-4 w-72 max-w-full" />
						</div>
						<footer className="flex h-9 items-center justify-between gap-2 border-t border-border/50 px-2">
							<Skeleton className="h-4 w-32" />
						</footer>
					</section>
				</div>
			</div>
		</LoadingShell>
	)
}

function JsonToolSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<section className="flex flex-wrap items-center gap-2 border border-border/50 bg-card p-3">
					<Skeleton className="h-8 w-80 max-w-full rounded-md" />
					<Skeleton className="h-8 w-28 rounded-md" />
					<Skeleton className="h-7 w-24 rounded-md" />
					<div className="ml-auto flex items-center gap-0.5">
						<Skeleton className="h-7 w-32" />
						<Skeleton className="h-7 w-44" />
					</div>
				</section>

				<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
					<section className="flex min-w-0 flex-col border border-border/50 bg-card">
						<header className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
							<Skeleton className="h-4 w-32" />
							<IconGroup count={3} />
						</header>
						<div className="h-[28rem] w-full p-2">
							<Skeleton className="h-full w-full rounded-none" />
						</div>
					</section>

					<section className="flex min-w-0 flex-col border border-border/50 bg-card">
						<header className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
							<Skeleton className="h-4 w-24" />
							<IconGroup count={2} />
						</header>
						<div className="h-[28rem] overflow-hidden p-2">
							<Skeleton className="h-4 w-72 max-w-full" />
						</div>
					</section>
				</div>
			</div>
		</LoadingShell>
	)
}

function SvgConverterSkeleton() {
	return (
		<LoadingShell>
			<div className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[1560px] -translate-x-1/2 border-y border-border/70 bg-background p-3 md:p-4">
				<div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border/60 pb-3">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-3 w-44 rounded-none" />
						<Skeleton className="h-5 w-40 rounded-none" />
					</div>
					<Skeleton className="h-4 w-72 max-w-full rounded-none" />
				</div>

				<div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(340px,1fr)_minmax(420px,1.25fr)] xl:divide-x xl:divide-border/60">
					<div className="min-w-0 xl:pr-4">
						<section className="border-b border-border/60 pb-3">
							<div className="mb-2 flex items-center justify-between gap-2">
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-3.5 w-16 rounded-none" />
									<Skeleton className="h-3 w-48 rounded-none" />
								</div>
								<div className="flex gap-1">
									<Skeleton className="h-9 w-20 rounded-md" />
									<Skeleton className="h-9 w-20 rounded-md" />
									<Skeleton className="size-9 rounded-md" />
								</div>
							</div>
							<Skeleton className="h-32 w-full rounded-none" />
						</section>

						<section className="pt-3">
							<div className="mb-2 flex items-end justify-between gap-2">
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-3.5 w-24 rounded-none" />
									<Skeleton className="h-3 w-56 rounded-none" />
								</div>
								<Skeleton className="size-8 rounded-none" />
							</div>
							<div className="relative mb-2">
								<Skeleton className="h-9 w-full rounded-none" />
							</div>
							<div className="mb-2 flex flex-wrap items-center gap-1">
								<Skeleton className="mr-auto h-4 w-32 rounded-none" />
								<Skeleton className="h-[26px] w-11 rounded-none" />
								<Skeleton className="h-[26px] w-14 rounded-none" />
								<Skeleton className="h-[26px] w-[74px] rounded-none" />
								<Skeleton className="h-[26px] w-16 rounded-none" />
							</div>
							<div className="border">
								<div className="px-4 py-12">
									<Skeleton className="mx-auto h-4 w-48 rounded-none" />
								</div>
							</div>
						</section>
					</div>

					<div className="min-w-0 xl:px-4">
						<div className="grid min-h-[680px] place-items-center border border-dashed p-8">
							<Skeleton className="h-4 w-64 max-w-full rounded-none" />
						</div>
						<section className="border-t border-border/60 pt-3">
							<div className="mb-2 flex items-center justify-between">
								<Skeleton className="h-3.5 w-16 rounded-none" />
								<Skeleton className="h-8 w-32 rounded-none" />
							</div>
							<div className="mb-3 border bg-muted/20 p-2">
								<Skeleton className="mb-1.5 h-3 w-3/4 rounded-none" />
								<Skeleton className="h-3 w-2/3 rounded-none" />
							</div>
							<div className="mb-3 flex items-start gap-2">
								<Skeleton className="mt-0.5 size-3.5 rounded-none" />
								<div className="flex-1">
									<Skeleton className="mb-1.5 h-3 w-52 max-w-full rounded-none" />
									<Skeleton className="h-3 w-full rounded-none" />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-1.5">
								<Skeleton className="h-[34px] w-full rounded-none" />
								<Skeleton className="h-[34px] w-full rounded-none" />
								<Skeleton className="h-[34px] w-full rounded-none" />
								<Skeleton className="h-[34px] w-full rounded-none" />
							</div>
						</section>
					</div>

					<div className="min-w-0 xl:pl-4">
						<section className="flex min-h-[680px] flex-col lg:max-h-[calc(100vh-8rem)]">
							<div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-3.5 w-16 rounded-none" />
									<Skeleton className="h-3 w-40 rounded-none" />
								</div>
								<IconGroup count={4} className="size-[30px] rounded-none" gap="gap-1" />
							</div>
							<div className="flex gap-3 border-b px-3 py-2">
								<Skeleton className="h-3.5 w-16 rounded-none" />
								<Skeleton className="h-3.5 w-16 rounded-none" />
								<Skeleton className="h-3.5 w-14 rounded-none" />
							</div>
							<div className="min-h-0 grow overflow-hidden border-x border-b bg-[#111] p-4">
								<div className="flex flex-col gap-2">
									<Skeleton className="h-3 w-2/3 rounded-none bg-neutral-800" />
									<Skeleton className="h-3 w-1/2 rounded-none bg-neutral-800" />
									<Skeleton className="h-3 w-3/4 rounded-none bg-neutral-800" />
									<Skeleton className="h-3 w-1/3 rounded-none bg-neutral-800" />
									<Skeleton className="h-3 w-5/6 rounded-none bg-neutral-800" />
									<Skeleton className="h-3 w-2/5 rounded-none bg-neutral-800" />
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</LoadingShell>
	)
}

export function HemelsbreedSkeleton() {
	return (
		<LoadingShell>
			<div className="grid gap-4 lg:grid-cols-[1fr_360px]">
				<div className="flex flex-col gap-3">
					<div className="relative flex items-center gap-2">
						<Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
						<Skeleton className="h-9 w-24 shrink-0 rounded-md" />
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<div className="min-w-[16rem] flex-1">
							<Skeleton className="h-10 w-full rounded-md" />
						</div>
						<Skeleton className="h-9 w-28 shrink-0 rounded-md" />
						<Skeleton className="h-9 w-32 shrink-0 rounded-md" />
						<Skeleton className="h-9 w-36 shrink-0 rounded-md" />
						<Skeleton className="h-9 w-28 shrink-0 rounded-md" />
						<Skeleton className="h-9 w-28 shrink-0 rounded-md" />
						<Skeleton className="h-9 w-28 shrink-0 rounded-md" />
					</div>

					<Skeleton className="h-[420px] w-full rounded-none border border-border/50 bg-muted/40 md:h-[560px]" />

					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-3 w-full max-w-2xl rounded-none" />
						<Skeleton className="h-3 w-2/3 max-w-md rounded-none" />
					</div>
				</div>

				<aside className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-2">
						<Skeleton className="h-5 w-24 rounded-none" />
						<Skeleton className="h-7 w-16 rounded-md" />
					</div>

					<Skeleton className="h-[72px] w-full rounded-none border border-dashed border-border/60" />

					<div className="flex flex-col gap-2 border border-border/50 bg-muted/20 p-3">
						<div className="flex items-center justify-between gap-2">
							<Skeleton className="h-5 w-48 rounded-none" />
							<Skeleton className="h-[18px] w-20 rounded-none" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 flex-1 rounded-md" />
							<Skeleton className="h-8 w-20 shrink-0 rounded-md" />
						</div>
						<Skeleton className="h-3 w-5/6 rounded-none" />
					</div>

					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-3 w-full rounded-none" />
						<Skeleton className="h-3 w-full rounded-none" />
						<Skeleton className="h-3 w-full rounded-none" />
						<Skeleton className="h-3 w-full rounded-none" />
						<Skeleton className="h-3 w-3/4 rounded-none" />
					</div>
				</aside>
			</div>
		</LoadingShell>
	)
}

export function CoordinateMarkerSkeleton() {
	return (
		<LoadingShell>
			<div className="grid gap-4 lg:grid-cols-[1fr_360px]">
				<div className="flex flex-col gap-3">
					<div className="relative">
						<Skeleton className="h-10 w-full rounded-md" />
					</div>

					<div className="relative">
						<Skeleton className="h-[420px] w-full rounded-md border border-border md:h-[560px]" />
						<div className="absolute right-2 top-2 z-[900] flex items-center gap-2 rounded-md border border-border bg-popover/90 px-2 py-1.5 shadow-lg shadow-black/40 backdrop-blur">
							<Skeleton className="h-[26px] w-28 rounded" />
							<Skeleton className="h-[26px] w-24 rounded" />
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-3 w-full max-w-2xl rounded-none" />
						<Skeleton className="h-3 w-1/2 max-w-sm rounded-none" />
					</div>
				</div>

				<aside className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-20 rounded-none" />
						<Skeleton className="h-4 w-14 rounded-none" />
					</div>

					<Skeleton className="h-[90px] w-full rounded-md border border-border/60" />

					<div className="flex flex-col gap-1.5 border-t border-border/50 pt-2">
						<Skeleton className="h-3 w-full rounded-none" />
						<Skeleton className="h-3 w-full rounded-none" />
						<Skeleton className="h-3 w-2/3 rounded-none" />
					</div>
				</aside>
			</div>
		</LoadingShell>
	)
}

function MyLocationSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2">
					<Skeleton className="h-10 w-[180px] rounded-md" />
				</div>

				<div className="border border-dashed border-border/50 p-6">
					<div className="flex flex-col items-center gap-2">
						<Skeleton className="h-4 w-full max-w-xl rounded-none" />
						<Skeleton className="h-4 w-full max-w-lg rounded-none" />
						<Skeleton className="h-4 w-2/3 max-w-md rounded-none" />
					</div>
				</div>
			</div>
		</LoadingShell>
	)
}

function MediaDropzoneSkeleton() {
	return (
		<div className="flex flex-col items-center gap-1 border border-dashed border-border/50 bg-card px-4 py-8">
			<Skeleton className="size-5" />
			<Skeleton className="h-5 w-56 max-w-full" />
			<Skeleton className="h-4 w-80 max-w-full" />
		</div>
	)
}

function SendableVideoSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-2">
					<MediaDropzoneSkeleton />
				</div>

				<section className="flex flex-col gap-3 border border-border/50 bg-card p-3">
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-7 w-[86px]" />
						<Skeleton className="h-8 w-[172px]" />
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-8 w-[112px]" />
						<Skeleton className="h-8 w-[104px]" />
					</div>
					<Skeleton className="h-4 w-56 max-w-full rounded-sm" />
				</section>
			</div>
		</LoadingShell>
	)
}

function GifToVideoSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<MediaDropzoneSkeleton />

				<section className="flex flex-col gap-3 border border-border/50 bg-card p-3">
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-11 rounded-sm" />
							<Skeleton className="h-8 w-[116px]" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-12 rounded-sm" />
							<Skeleton className="h-8 w-[166px]" />
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-8 w-[140px]" />
					</div>
					<Skeleton className="h-4 w-56 max-w-full rounded-sm" />
				</section>
			</div>
		</LoadingShell>
	)
}

function VideoToGifSkeleton() {
	return (
		<LoadingShell>
			<div className="flex flex-col gap-3">
				<MediaDropzoneSkeleton />

				<section className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-border/50 bg-card p-3">
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-16 rounded-sm" />
						<Skeleton className="h-8 w-[228px]" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-10 rounded-sm" />
						<Skeleton className="h-8 w-[232px]" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-12 rounded-sm" />
						<Skeleton className="h-8 w-[166px]" />
					</div>
				</section>

				<section className="flex flex-col gap-3 border border-border/50 bg-card p-3">
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-8 w-[180px]" />
						<Skeleton className="h-8 w-[132px]" />
					</div>
					<Skeleton className="h-4 w-56 max-w-full rounded-sm" />
				</section>
			</div>
		</LoadingShell>
	)
}

export const TOOL_SKELETONS: Record<TToolSlug, ComponentType> = {
	'find-replace': FindReplaceSkeleton,
	'diff-checker': DiffCheckerSkeleton,
	'link-extractor': LinkExtractorSkeleton,
	'json-tool': JsonToolSkeleton,
	'svg-converter': SvgConverterSkeleton,
	hemelsbreed: HemelsbreedSkeleton,
	'coordinate-marker': CoordinateMarkerSkeleton,
	'my-location': MyLocationSkeleton,
	'sendable-video': SendableVideoSkeleton,
	'gif-to-video': GifToVideoSkeleton,
	'video-to-gif': VideoToGifSkeleton
}
