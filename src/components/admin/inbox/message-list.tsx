import { CircleX, Clock, CornerUpLeft, Search, Star, X } from 'lucide-react'
import type { RefObject } from 'react'
import { cn } from '@/shared/lib/cn'
import {
	INBOX_FOLDERS,
	formatListDate,
	getMessageSubject
} from './inbox-format'
import type {
	InboxBulkAction,
	InboxCounts,
	InboxFolder,
	InboxItem
} from './types'

type Props = {
	items: InboxItem[]
	selectedId: string | null
	selectedIds: Set<string>
	confirmingBulkDelete: boolean
	folder: InboxFolder
	counts: InboxCounts
	query: string
	loading: boolean
	hasMore: boolean
	loadingMore: boolean
	searchRef: RefObject<HTMLInputElement | null>
	onFolderChange: (folder: InboxFolder) => void
	onQueryChange: (query: string) => void
	onSelect: (id: string) => void
	onToggleSelect: (id: string) => void
	onSelectAll: () => void
	onClearSelection: () => void
	onBulk: (action: InboxBulkAction) => void
	onLoadMore: () => void
}

const LIST_ID = 'inbox-message-list'

function ReplyMark({ item }: { item: InboxItem }) {
	if (item.lastReplyStatus === 'failed') {
		return (
			<span className="flex items-center gap-1 admin-text-xs admin-text-danger">
				<CircleX aria-hidden="true" className="size-3.5" />
				Reply failed
			</span>
		)
	}
	if (
		item.lastReplyStatus === 'uncertain' ||
		item.lastReplyStatus === 'pending'
	) {
		return (
			<span className="flex items-center gap-1 admin-text-xs admin-text-warning">
				<Clock aria-hidden="true" className="size-3.5" />
				Check delivery
			</span>
		)
	}
	if (item.repliedAt) {
		return (
			<span className="admin-text-xs flex items-center gap-1">
				<CornerUpLeft aria-hidden="true" className="size-3.5" />
				Replied
			</span>
		)
	}
	return null
}

export function MessageList({
	items,
	selectedId,
	selectedIds,
	confirmingBulkDelete,
	folder,
	counts,
	query,
	loading,
	hasMore,
	loadingMore,
	searchRef,
	onFolderChange,
	onQueryChange,
	onSelect,
	onToggleSelect,
	onSelectAll,
	onClearSelection,
	onBulk,
	onLoadMore
}: Props) {
	const now = new Date()
	const busyMessage = loading
		? 'Loading messages'
		: loadingMore
			? 'Loading more messages'
			: ''

	return (
		<div
			className="flex min-h-0 flex-col border-border md:border-r"
			aria-busy={loading || loadingMore}
		>
			<span role="status" className="sr-only">
				{busyMessage}
			</span>
			<div className="space-y-3 border-b border-border p-3">
				<label className="relative block">
					<span className="sr-only">Search messages</span>
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						ref={searchRef}
						type="search"
						aria-controls={LIST_ID}
						value={query}
						onChange={event => onQueryChange(event.target.value)}
						placeholder="Search messages"
						className="admin-field admin-text-xs h-8 !pl-8"
					/>
				</label>
				<div
					role="group"
					aria-label="Folders"
					className="admin-segment flex-wrap"
				>
					{INBOX_FOLDERS.map(entry => (
						<button
							key={entry.key}
							type="button"
							data-active={folder === entry.key}
							aria-pressed={folder === entry.key}
							onClick={() => onFolderChange(entry.key)}
							className="admin-segment-item flex min-h-6 items-center gap-2"
						>
							{entry.label}
							<span className="sr-only">, </span>
							<span className="admin-text-xs tabular-nums text-muted-foreground">
								{counts[entry.key]}
							</span>
						</button>
					))}
				</div>
			</div>

			{selectedIds.size > 0 && (
				<div
					role="toolbar"
					aria-label="Bulk message actions"
					className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-3 py-2 admin-text-xs"
				>
					<span role="status" className="mr-auto tabular-nums">
						{selectedIds.size} selected
					</span>
					<button
						type="button"
						onClick={onSelectAll}
						className="admin-btn min-h-6"
						data-size="sm"
					>
						Select all
					</button>
					<button
						type="button"
						onClick={() => onBulk('read')}
						className="admin-btn min-h-6"
						data-size="sm"
					>
						Read
					</button>
					<button
						type="button"
						onClick={() => onBulk('unread')}
						className="admin-btn min-h-6"
						data-size="sm"
					>
						Unread
					</button>
					<button
						type="button"
						onClick={() =>
							onBulk(
								folder === 'archived' ? 'unarchive' : 'archive'
							)
						}
						className="admin-btn min-h-6"
						data-size="sm"
					>
						{folder === 'archived' ? 'Unarchive' : 'Archive'}
					</button>
					<button
						type="button"
						onClick={() => onBulk('delete')}
						className="admin-btn min-h-6"
						data-size="sm"
						data-variant="danger"
						data-confirming={confirmingBulkDelete}
					>
						{confirmingBulkDelete ? 'Confirm delete' : 'Delete'}
					</button>
					<button
						type="button"
						onClick={onClearSelection}
						aria-label="Clear selection"
						className="admin-icon-btn min-h-6 min-w-6"
					>
						<X aria-hidden="true" className="size-3.5" />
					</button>
				</div>
			)}

			{items.length === 0 ? (
				<p
					id={LIST_ID}
					className="admin-text-xs admin-text-muted p-6 text-center"
				>
					{loading
						? 'Loading…'
						: query.trim()
							? 'No messages match your search.'
							: 'Nothing in this folder.'}
				</p>
			) : (
				<ul
					id={LIST_ID}
					aria-label="Messages"
					className={cn(
						'min-h-0 flex-1 overflow-y-auto transition-opacity',
						loading && 'opacity-60'
					)}
				>
					{items.map(item => {
						const isUnread = item.readAt === null
						const isSelected = item.id === selectedId
						return (
							<li
								key={item.id}
								className="flex border-b border-border"
							>
								<label className="flex min-w-6 items-start justify-center px-3 pt-3.5">
									<input
										type="checkbox"
										aria-label={`Select message: ${getMessageSubject(item)}`}
										checked={selectedIds.has(item.id)}
										onChange={() => onToggleSelect(item.id)}
										className="size-4 cursor-pointer"
									/>
								</label>
								<button
									type="button"
									onClick={() => onSelect(item.id)}
									aria-current={
										isSelected ? 'true' : undefined
									}
									className={cn(
										'flex min-w-0 flex-1 gap-2 py-3 pr-4 text-left transition-colors hover:bg-secondary/60',
										isSelected && 'bg-secondary'
									)}
								>
									{isUnread && (
										<span className="sr-only">Unread</span>
									)}
									<span
										aria-hidden="true"
										className={cn(
											'mt-1.5 size-1.5 shrink-0 rounded-full',
											isUnread
												? 'bg-[color:var(--admin-success)]'
												: 'bg-transparent'
										)}
									/>
									<span className="min-w-0 flex-1 space-y-0.5">
										<span className="flex items-center justify-between gap-2">
											<span
												className={cn(
													'admin-text-sm truncate',
													isUnread
														? 'font-semibold'
														: 'font-normal text-foreground/80'
												)}
											>
												{item.name}
											</span>
											<span className="admin-text-xs admin-text-muted flex shrink-0 items-center gap-2">
												{item.starredAt && (
													<Star
														role="img"
														aria-label="Starred"
														className="size-3 admin-text-warning fill-current"
													/>
												)}
												{formatListDate(
													item.createdAt,
													now
												)}
											</span>
										</span>
										<span
											className={cn(
												'admin-text-xs block truncate',
												isUnread
													? 'font-medium'
													: 'text-foreground/80'
											)}
										>
											{getMessageSubject(item)}
										</span>
										<span className="admin-text-xs admin-text-muted line-clamp-2">
											{item.preview}
										</span>
										<span className="admin-text-xs admin-text-muted flex items-center gap-3 empty:hidden">
											<ReplyMark item={item} />
										</span>
									</span>
								</button>
							</li>
						)
					})}
					{hasMore && (
						<li className="p-3">
							<button
								type="button"
								onClick={onLoadMore}
								disabled={loadingMore}
								aria-busy={loadingMore}
								className="admin-btn min-h-6 w-full"
							>
								{loadingMore ? 'Loading…' : 'Load more'}
							</button>
						</li>
					)}
				</ul>
			)}
		</div>
	)
}
