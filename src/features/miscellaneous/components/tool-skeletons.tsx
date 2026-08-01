import { cn } from '@/shared/lib/cn'

type TBlockProps = {
	className?: string
}

function Block({ className }: TBlockProps) {
	return <div className={cn('animate-pulse bg-muted/60', className)} />
}

function PanelHeader({ className }: TBlockProps) {
	return (
		<div
			className={cn(
				'flex items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5',
				className
			)}
		>
			<Block className="h-4 w-16" />
			<Block className="h-7 w-28 max-w-[40%]" />
		</div>
	)
}

function PanelFooter() {
	return (
		<div className="border-t border-border/50 px-3 py-1">
			<Block className="h-4 w-24" />
		</div>
	)
}

export function FindReplaceSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading find and replace"
			className="flex flex-col gap-3"
		>
			<div className="flex h-7 flex-wrap items-center justify-between gap-2">
				<Block className="h-7 w-40" />
				<Block className="h-7 w-72 max-w-full" />
			</div>
			<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Block className="h-9 flex-1" />
					<Block className="h-9 sm:w-56" />
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Block className="h-9 flex-1" />
					<Block className="h-9 sm:w-72" />
				</div>
				<div className="min-h-4" />
			</div>
			<div className="flex flex-col border border-border/50 bg-card md:flex-row md:items-stretch">
				<div className="min-w-0 flex-1">
					<PanelHeader />
					<Block className="h-72 w-full md:h-96" />
					<PanelFooter />
				</div>
				<div className="hidden w-1 shrink-0 md:block" />
				<div className="min-w-0 flex-1 border-t border-border/50 md:border-t-0">
					<PanelHeader />
					<Block className="h-72 w-full md:h-96" />
					<PanelFooter />
				</div>
			</div>
			<Block className="h-7 w-32" />
			<Block className="h-7 w-44" />
		</div>
	)
}

export function DiffCheckerSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading diff checker"
			className="flex flex-col gap-3"
		>
			<div className="flex h-7 flex-wrap items-center justify-end gap-1">
				<Block className="h-7 w-24" />
				<Block className="h-7 w-16" />
			</div>
			<div className="grid grid-cols-1 divide-y divide-border/50 border border-border/50 bg-card md:grid-cols-2 md:divide-x md:divide-y-0">
				<div className="flex min-w-0 flex-col">
					<PanelHeader className="border-b" />
					<Block className="h-64 w-full md:h-80" />
					<PanelFooter />
				</div>
				<div className="flex min-w-0 flex-col">
					<PanelHeader className="border-b" />
					<Block className="h-64 w-full md:h-80" />
					<PanelFooter />
				</div>
			</div>
			<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<Block className="h-4 w-40" />
					<Block className="h-8 w-64 max-w-full" />
				</div>
				<div className="border border-border/50 bg-background/50 px-3 py-8">
					<Block className="mx-auto h-4 w-48" />
				</div>
			</div>
		</div>
	)
}

export function LinkExtractorSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading link extractor"
			className="flex flex-col gap-3"
		>
			<div className="flex flex-col gap-2 border border-border/50 bg-card p-3">
				<Block className="h-[34px] w-full max-w-2xl" />
				<Block className="h-[34px] w-full max-w-2xl" />
				<Block className="h-[34px] w-full max-w-2xl" />
				<div className="min-h-4" />
			</div>
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<div className="flex min-w-0 flex-col border border-border/50 bg-card">
					<div className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
						<Block className="h-4 w-28" />
						<Block className="h-7 w-16" />
					</div>
					<Block className="h-[26rem] w-full" />
					<div className="flex h-9 items-center border-t border-border/50 px-2">
						<Block className="h-4 w-32" />
					</div>
				</div>
				<div className="flex min-w-0 flex-col border border-border/50 bg-card">
					<div className="flex items-center justify-between gap-2 border-b border-border/50 px-2 py-1.5">
						<Block className="h-4 w-28" />
						<Block className="h-7 w-16" />
					</div>
					<div className="border-b border-border/50 px-2 py-1.5">
						<Block className="h-7 w-64 max-w-full" />
					</div>
					<Block className="h-[26rem] w-full" />
					<div className="flex h-9 items-center border-t border-border/50 px-2">
						<Block className="h-4 w-24" />
					</div>
				</div>
			</div>
		</div>
	)
}

export function JsonToolSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading JSON tool"
			className="flex flex-col gap-3"
		>
			<div className="flex flex-wrap items-center gap-2 border border-border/50 bg-card p-3">
				<Block className="h-[34px] w-full max-w-3xl" />
			</div>
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<div className="flex min-w-0 flex-col border border-border/50 bg-card">
					<div className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
						<Block className="h-4 w-28" />
						<Block className="h-7 w-24" />
					</div>
					<Block className="h-[28rem] w-full" />
				</div>
				<div className="flex min-w-0 flex-col border border-border/50 bg-card">
					<div className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
						<Block className="h-4 w-24" />
						<Block className="h-7 w-16" />
					</div>
					<Block className="h-[28rem] w-full" />
				</div>
			</div>
		</div>
	)
}

export function SvgConverterSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading SVG converter"
			className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[1560px] -translate-x-1/2 border-y border-border/70 bg-background p-3 md:p-4"
		>
			<div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border/60 pb-3">
				<div className="flex flex-col gap-1">
					<Block className="h-3 w-24" />
					<Block className="h-5 w-44" />
				</div>
				<Block className="h-4 w-72 max-w-full" />
			</div>
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(340px,1fr)_minmax(420px,1.25fr)] xl:divide-x xl:divide-border/60">
				<div className="min-w-0 xl:pr-4">
					<div className="border-b border-border/60 pb-3">
						<div className="mb-2 flex items-center justify-between gap-2">
							<Block className="h-4 w-36" />
							<Block className="h-9 w-32" />
						</div>
						<Block className="min-h-32 w-full" />
					</div>
					<div className="pt-3">
						<div className="mb-2 flex items-end justify-between gap-2">
							<Block className="h-4 w-40" />
							<Block className="h-8 w-8" />
						</div>
						<Block className="mb-2 h-9 w-full" />
						<Block className="mb-2 h-[26px] w-full" />
						<div className="border border-border/60 px-4 py-12">
							<Block className="mx-auto h-4 w-40" />
						</div>
					</div>
				</div>
				<div className="min-w-0 xl:px-4">
					<div className="grid min-h-[680px] place-items-center border border-dashed border-border/60 p-8">
						<Block className="h-4 w-56 max-w-full" />
					</div>
					<div className="border-t border-border/60 pt-3">
						<div className="mb-2 flex items-center justify-between">
							<Block className="h-4 w-16" />
							<Block className="h-8 w-32" />
						</div>
						<Block className="mb-3 h-16 w-full" />
						<Block className="mb-3 h-10 w-full" />
						<div className="grid grid-cols-2 gap-1.5">
							<Block className="h-[34px]" />
							<Block className="h-[34px]" />
							<Block className="h-[34px]" />
							<Block className="h-[34px]" />
						</div>
					</div>
				</div>
				<div className="min-w-0 xl:pl-4">
					<div className="flex min-h-[680px] flex-col">
						<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
							<Block className="h-4 w-48 max-w-full" />
							<Block className="h-[30px] w-36" />
						</div>
						<div className="flex border-b border-border/60">
							<Block className="h-[30px] w-56 max-w-full" />
						</div>
						<Block className="min-h-0 grow border-x border-b border-border/60" />
					</div>
				</div>
			</div>
		</div>
	)
}

export function HemelsbreedSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading distance tool"
			className="grid gap-4 lg:grid-cols-[1fr_360px]"
		>
			<div className="flex flex-col gap-3">
				<Block className="h-9 w-64 max-w-full" />
				<div className="flex flex-wrap items-center gap-2">
					<Block className="h-10 min-w-[16rem] flex-1" />
					<Block className="h-9 w-72 max-w-full" />
				</div>
				<Block className="h-[420px] w-full border border-border/50 md:h-[560px]" />
				<Block className="h-8 w-full max-w-2xl" />
			</div>
			<aside className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<Block className="h-4 w-20" />
					<Block className="h-7 w-16" />
				</div>
				<Block className="h-[124px] w-full" />
				<Block className="h-24 w-full" />
			</aside>
		</div>
	)
}

export function CoordinateMarkerSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading coordinate marker"
			className="grid gap-4 lg:grid-cols-[1fr_360px]"
		>
			<div className="flex flex-col gap-3">
				<Block className="h-10 w-full rounded-md" />
				<Block className="h-[420px] w-full rounded-md border border-border/50 md:h-[560px]" />
				<Block className="h-8 w-full max-w-2xl" />
			</div>
			<aside className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<Block className="h-5 w-16" />
					<Block className="h-4 w-12" />
				</div>
				<Block className="h-[72px] w-full rounded-md" />
				<Block className="h-16 w-full" />
			</aside>
		</div>
	)
}

export function MyLocationSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading location tool"
			className="flex flex-col gap-4"
		>
			<Block className="h-10 w-48" />
			<div className="border border-dashed border-border/50 p-6">
				<Block className="mx-auto h-[60px] w-full max-w-2xl" />
			</div>
		</div>
	)
}

function DropzoneSkeleton() {
	return (
		<div className="flex flex-col items-center gap-1 border border-dashed border-border/50 bg-card px-4 py-8">
			<Block className="size-5" />
			<Block className="h-5 w-44 max-w-full" />
			<Block className="h-4 w-28 max-w-full" />
		</div>
	)
}

export function SendableVideoSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading video tool"
			className="flex flex-col gap-3"
		>
			<div className="flex flex-col gap-2">
				<DropzoneSkeleton />
			</div>
			<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
				<Block className="h-[34px] w-72 max-w-full" />
				<Block className="h-8 w-64 max-w-full" />
				<Block className="h-4 w-44" />
			</div>
		</div>
	)
}

export function GifToVideoSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading GIF converter"
			className="flex flex-col gap-3"
		>
			<DropzoneSkeleton />
			<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
				<Block className="h-[34px] w-96 max-w-full" />
				<Block className="h-8 w-40 max-w-full" />
				<Block className="h-4 w-40" />
			</div>
		</div>
	)
}

export function VideoToGifSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading GIF converter"
			className="flex flex-col gap-3"
		>
			<DropzoneSkeleton />
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-border/50 bg-card p-3">
				<Block className="h-[34px] w-full max-w-2xl" />
			</div>
			<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
				<Block className="h-8 w-72 max-w-full" />
				<Block className="h-4 w-44" />
			</div>
		</div>
	)
}
