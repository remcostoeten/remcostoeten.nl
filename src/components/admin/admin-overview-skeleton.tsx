import Link from 'next/link'
import {
	ArrowDown,
	ArrowUpRight,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Eye,
	Globe,
	Users
} from 'lucide-react'
import { AnimatedClockIcon } from '@/components/animated-icons/icons/clock'
import { AnimatedCommentIcon } from '@/components/animated-icons/icons/comment'
import { AnimatedMailIcon } from '@/components/animated-icons/icons/mail'
import { AnimatedSearchIcon } from '@/components/animated-icons/icons/search'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { cn } from '@/shared/lib/cn'
import type { ComponentType } from 'react'
import type { AnimatedIconProps } from '@/components/animated-icons/icon-frame'

const PULSE = 'animate-pulse bg-foreground/10 motion-reduce:animate-none'

const TABLE_ROWS = 8
const ACTIVITY_ROWS = 5
const COUNTRY_ROWS = 5
const VISITOR_ROWS = 7

const titleWidths = [
	'w-56',
	'w-72',
	'w-44',
	'w-64',
	'w-52',
	'w-80',
	'w-48',
	'w-60'
]

function Line({ className }: { className: string }) {
	return (
		<span
			aria-hidden="true"
			className={cn('inline-block max-w-full align-baseline', className)}
		>
			<span
				className={cn(
					'inline-block h-[0.8em] w-full rounded leading-none',
					PULSE
				)}
			>
				&nbsp;
			</span>
		</span>
	)
}

function Block({ className }: { className: string }) {
	return <span aria-hidden="true" className={cn('block', PULSE, className)} />
}

function MetricCellSkeleton({
	icon: Icon,
	label
}: {
	icon: ComponentType<AnimatedIconProps>
	label: string
}) {
	return (
		<div className="flex flex-col gap-3 bg-card p-5">
			<div className="flex items-center justify-between text-[13px] text-muted-foreground">
				<span>{label}</span>
				<Icon className="size-4" />
			</div>
			<span className="admin-metric-value">
				<Line className="w-20" />
			</span>
			<span className="text-[11px] text-muted-foreground">
				<Line className="w-28" />
			</span>
		</div>
	)
}

function BlogTableSkeleton() {
	return (
		<section className="admin-panel">
			<div className="admin-panel-header pb-4">
				<div>
					<h2 className="admin-panel-title">
						Blog posts
						<span className="ml-2 text-[13px] font-normal text-muted-foreground">
							<Line className="w-5" />
						</span>
					</h2>
					<p className="mt-1 text-[12px] text-muted-foreground">
						Your ideas, published and in progress.
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="admin-segment">
					<span
						className="admin-segment-item inline-flex items-center"
						data-active="true"
					>
						All posts
					</span>
					<span className="admin-segment-item inline-flex items-center">
						Published
					</span>
					<span className="admin-segment-item inline-flex items-center">
						Drafts
					</span>
				</div>
				<div className="relative">
					<AnimatedSearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
					<div className="admin-field h-8 py-0 pl-8 sm:w-56" />
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Title</th>
							<th className="w-28">Status</th>
							<th className="hidden w-32 md:table-cell">Date</th>
							<th className="w-24 !text-right">
								<span className="inline-flex items-center gap-1 text-foreground">
									Views
									<ArrowDown className="size-3" />
								</span>
							</th>
							<th className="w-12" />
						</tr>
					</thead>
					<tbody>
						{titleWidths
							.slice(0, TABLE_ROWS)
							.map((width, index) => (
								<tr key={index}>
									<td>
										<p className="max-w-[380px] text-[13px] font-medium">
											<Line className={width} />
										</p>
										<p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
											<AnimatedClockIcon className="size-3" />
											<Line className="w-12" />
										</p>
									</td>
									<td>
										<Block className="h-[22px] w-[72px] rounded-[5px]" />
									</td>
									<td className="hidden md:table-cell">
										<Line className="w-20" />
									</td>
									<td className="text-right">
										<Line className="w-10" />
									</td>
									<td />
								</tr>
							))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
				<span>
					<Line className="w-24" />
				</span>
				<div className="flex items-center gap-1">
					<span className="admin-icon-btn size-7 opacity-40">
						<ChevronLeft className="size-3.5" />
					</span>
					<span className="admin-icon-btn size-7 opacity-40">
						<ChevronRight className="size-3.5" />
					</span>
				</div>
			</div>
		</section>
	)
}

function PanelFooterSkeleton({ label }: { label: string }) {
	return (
		<div className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-[12px] text-muted-foreground">
			{label}
			<ChevronDown className="size-3" />
		</div>
	)
}

function ActivityFeedSkeleton() {
	return (
		<section className="admin-panel">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Recent activity</h2>
				<span className="admin-live-dot" aria-hidden="true" />
			</div>

			<ul>
				{Array.from({ length: ACTIVITY_ROWS }, (_, index) => (
					<li
						key={index}
						className="flex gap-3 border-t border-border/60 px-5 py-4"
					>
						<span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border">
							<Block className="size-3.5 rounded-sm" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-[13px] font-medium">
								<Line className="w-24" />
							</p>
							<p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
								<Line className="w-full" />
								<Line className="w-2/3" />
							</p>
							<p className="mt-1 text-[12px] text-muted-foreground/70">
								<Line className="w-5/6" />
							</p>
							<p className="mt-1.5 text-[11px] text-muted-foreground/60">
								<Line className="w-16" />
							</p>
						</div>
					</li>
				))}
			</ul>

			<PanelFooterSkeleton label="View all activity" />
		</section>
	)
}

function CountryTrafficSkeleton() {
	return (
		<section className="admin-panel">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Traffic by country</h2>
				<Globe className="size-4 text-muted-foreground" />
			</div>

			<ul className="space-y-4 px-5 pb-5">
				{Array.from({ length: COUNTRY_ROWS }, (_, index) => (
					<li key={index} className="flex items-center gap-3">
						<span className="flex h-6 w-5 shrink-0 items-center justify-center">
							<Block className="size-4 rounded-full" />
						</span>
						<div className="min-w-0 flex-1 space-y-1.5">
							<div className="flex items-center justify-between gap-2 text-[12px]">
								<Line className="w-24" />
								<Line className="w-8" />
							</div>
							<div className="flex items-center gap-3">
								<div className="admin-bar flex-1" />
								<span className="w-8 text-right text-[10px] text-muted-foreground">
									<Line className="w-6" />
								</span>
							</div>
						</div>
					</li>
				))}
			</ul>

			<PanelFooterSkeleton label="View all countries" />
		</section>
	)
}

function StatCellSkeleton({
	label,
	tone
}: {
	label: string
	tone?: 'success'
}) {
	return (
		<div className="space-y-1.5">
			<span className="admin-metric-value block text-[24px]">
				<Line className="w-10" />
			</span>
			<span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
				{tone === 'success' && (
					<span className="size-1.5 rounded-full bg-[color:var(--admin-success)]" />
				)}
				{label}
			</span>
		</div>
	)
}

function ContactOverviewSkeleton() {
	return (
		<section className="admin-panel h-full">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Contact activity</h2>
				<AnimatedMailIcon className="size-4 text-muted-foreground" />
			</div>

			<div className="grid grid-cols-3 gap-4 px-5 pb-5">
				<StatCellSkeleton label="Submitted" tone="success" />
				<StatCellSkeleton label="Abandoned" />
				<StatCellSkeleton label="Form clicks" />
			</div>

			<div className="border-t border-border px-5 py-4">
				<div className="mb-3 flex items-center justify-between">
					<p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
						Latest message
					</p>
					<div className="flex items-center gap-3 text-[11px]">
						<span className="text-muted-foreground">Show more</span>
						<Link
							href="/admin/messages"
							className="text-foreground"
						>
							Open inbox
						</Link>
					</div>
				</div>

				<div className="rounded-md border border-border bg-background p-4">
					<div className="flex items-center justify-between gap-2">
						<p className="text-[13px] font-medium">
							<Line className="w-32" />
						</p>
						<span className="text-[11px] text-muted-foreground">
							<Line className="w-20" />
						</span>
					</div>
					<p className="mt-0.5 text-[11px] text-muted-foreground">
						<Line className="w-40" />
					</p>
					<p className="mt-2 text-[12px] leading-relaxed">
						<Line className="w-full" />
						<Line className="w-full" />
						<Line className="w-3/4" />
					</p>
				</div>
			</div>
		</section>
	)
}

function VisitorLogSkeleton() {
	return (
		<section className="admin-panel h-full">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Live visitor log</h2>
				<span className="flex items-center gap-2 text-[11px] text-muted-foreground">
					<span className="admin-live-dot" aria-hidden="true" />
					Live
				</span>
			</div>

			<div className="h-[360px] overflow-hidden">
				<ul>
					{Array.from({ length: VISITOR_ROWS }, (_, index) => (
						<li
							key={index}
							className="flex items-center gap-3 border-t border-border/60 px-5 py-3"
						>
							<Block className="size-7 shrink-0 rounded-full" />
							<div className="min-w-0 flex-1">
								<p className="text-[12px] font-medium">
									<Line className="w-44" />
								</p>
								<p className="text-[11px] text-muted-foreground">
									<Line className="w-28" />
								</p>
							</div>
							<span className="text-[11px] text-muted-foreground">
								<Line className="w-10" />
							</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}

export function AdminOverviewSkeleton() {
	return (
		<div
			className="space-y-8"
			aria-busy="true"
			aria-label="Loading overview"
		>
			<AdminPageHeader
				title="Overview"
				description="Welcome back, Remco. Here's what's happening with your site."
				actions={
					<Link
						href="/blog"
						className="admin-btn"
						data-variant="primary"
					>
						View posts
						<ArrowUpRight className="size-4" />
					</Link>
				}
			/>

			<div className="admin-panel grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
				<MetricCellSkeleton icon={Eye} label="Total views" />
				<MetricCellSkeleton icon={Users} label="Unique visitors" />
				<MetricCellSkeleton
					icon={AnimatedCommentIcon}
					label="Comments"
				/>
				<MetricCellSkeleton icon={AnimatedMailIcon} label="Messages" />
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
				<div className="min-w-0">
					<BlogTableSkeleton />
				</div>
				<aside className="space-y-6">
					<ActivityFeedSkeleton />
					<CountryTrafficSkeleton />
				</aside>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<ContactOverviewSkeleton />
				<VisitorLogSkeleton />
			</div>
		</div>
	)
}
