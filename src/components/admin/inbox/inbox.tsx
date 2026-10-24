'use client'

import { useEffect, useRef, useState } from 'react'
import {
	deleteMessage,
	deleteMessages,
	loadInboxPage,
	openMessage,
	refreshMessage,
	setMessageFlag,
	setMessagesFlag
} from '@/server/actions/contact/inbox'
import type { GmailStatus } from '@/server/gmail/connection'
import {
	applyBulkToItems,
	applyReplyToDetail,
	CONFIRM_RESET_MS,
	FLAG_KEYS,
	getBulkFlag,
	getBulkStep,
	isReadAction,
	isTyping,
	mergeById,
	mergeRefreshedDetail,
	mergeReplyStatuses,
	POLL_INTERVAL_MS,
	SEARCH_DEBOUNCE_MS,
	shouldPoll
} from './inbox-logic'
import { MessageList } from './message-list'
import { MessageReader } from './message-reader'
import type {
	InboxBulkAction,
	InboxCounts,
	InboxDetail,
	InboxFlag,
	InboxFolder,
	InboxItem,
	InboxPage,
	InboxReply,
	ReplySnippets
} from './types'

type Props = {
	initialPage: InboxPage
	initialCounts: InboxCounts
	initialDetail: InboxDetail | null
	gmail: GmailStatus
	snippets: ReplySnippets
}

export function Inbox({
	initialPage,
	initialCounts,
	initialDetail,
	gmail,
	snippets
}: Props) {
	const [items, setItems] = useState(initialPage.items)
	const [hasMore, setHasMore] = useState(initialPage.hasMore)
	const [counts, setCounts] = useState(initialCounts)
	const [folder, setFolder] = useState<InboxFolder>('inbox')
	const [query, setQuery] = useState('')
	const [selectedId, setSelectedId] = useState<string | null>(
		initialDetail?.id ?? null
	)
	const [detail, setDetail] = useState(initialDetail)
	const [loadingList, setLoadingList] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)
	const [loadingDetail, setLoadingDetail] = useState(false)
	const [composerOpen, setComposerOpen] = useState(false)
	const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
		null
	)
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
	const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const searchRef = useRef<HTMLInputElement>(null)
	const listRequest = useRef(0)
	const detailRequest = useRef(0)
	const isFirstList = useRef(true)
	const pollRequest = useRef(0)
	const replyEpoch = useRef(0)
	const pollInFlight = useRef(false)

	const selectedIndex = items.findIndex(item => item.id === selectedId)

	function patchItem(id: string, patch: Partial<InboxItem>) {
		setItems(current =>
			current.map(item => (item.id === id ? { ...item, ...patch } : item))
		)
	}

	function patchDetail(id: string, patch: Partial<InboxDetail>) {
		setDetail(current =>
			current && current.id === id ? { ...current, ...patch } : current
		)
	}

	async function open(id: string) {
		const request = ++detailRequest.current
		setSelectedId(id)
		setConfirmingDeleteId(null)
		setComposerOpen(false)
		setLoadingDetail(true)
		setError(null)

		const target = items.find(item => item.id === id)
		if (target && target.readAt === null) {
			patchItem(id, { readAt: new Date().toISOString() })
		}

		try {
			const result = await openMessage(id)
			if (request !== detailRequest.current) return

			if (!result) {
				setDetail(null)
				setSelectedId(null)
				setError('That message could not be opened')
				return
			}
			setDetail(result.detail)
			setCounts(result.counts)
		} catch {
			if (request === detailRequest.current) {
				setError('That message could not be opened')
			}
		} finally {
			if (request === detailRequest.current) setLoadingDetail(false)
		}
	}

	function leaveMessage(id: string) {
		const index = items.findIndex(item => item.id === id)
		const next = items[index + 1] ?? items[index - 1] ?? null
		setItems(current => current.filter(item => item.id !== id))

		if (next) void open(next.id)
		else {
			detailRequest.current += 1
			setSelectedId(null)
			setDetail(null)
		}
	}

	async function toggle(flag: InboxFlag) {
		if (!detail) return
		const { id } = detail
		const key = FLAG_KEYS[flag]
		const previous = detail[key]
		const next = previous ? null : new Date().toISOString()

		patchDetail(id, { [key]: next })
		patchItem(id, { [key]: next })
		setError(null)

		const result = await setMessageFlag(id, flag, next !== null)
		if (!result.success) {
			patchDetail(id, { [key]: previous })
			patchItem(id, { [key]: previous })
			setError(result.error)
			return
		}

		setCounts(result.counts)
		if (flag === 'archived') leaveMessage(id)
	}

	async function remove() {
		if (!detail) return
		if (confirmingDeleteId !== detail.id) {
			setConfirmingDeleteId(detail.id)
			return
		}

		const { id } = detail
		setConfirmingDeleteId(null)
		setError(null)

		const result = await deleteMessage(id)
		if (!result.success) {
			setError(result.error)
			return
		}

		setCounts(result.counts)
		leaveMessage(id)
	}

	function toggleSelect(id: string) {
		setConfirmingBulkDelete(false)
		setSelectedIds(current => {
			const next = new Set(current)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	function clearSelection() {
		setConfirmingBulkDelete(false)
		setSelectedIds(new Set())
	}

	async function runBulk(action: InboxBulkAction) {
		const ids = [...selectedIds]
		const step = getBulkStep(action, ids.length, confirmingBulkDelete)
		if (step === 'ignore') return
		if (step === 'confirm') {
			setConfirmingBulkDelete(true)
			return
		}

		setConfirmingBulkDelete(false)
		setError(null)

		const flagged = action === 'delete' ? null : getBulkFlag(action)
		const result =
			action === 'delete' || !flagged
				? await deleteMessages(ids)
				: await setMessagesFlag(ids, flagged.flag, flagged.value)

		if (!result.success) {
			setError(result.error)
			return
		}

		setCounts(result.counts)
		const now = new Date().toISOString()
		setItems(current => applyBulkToItems(current, selectedIds, action, now))

		if (isReadAction(action)) {
			if (detail && selectedIds.has(detail.id)) {
				patchDetail(detail.id, {
					readAt: action === 'read' ? now : null
				})
			}
		} else if (selectedId && selectedIds.has(selectedId)) {
			detailRequest.current += 1
			setSelectedId(null)
			setDetail(null)
		}

		setSelectedIds(new Set())
	}

	function applyReply(reply: InboxReply) {
		if (!detail) return
		replyEpoch.current += 1
		const { detailPatch, itemPatch } = applyReplyToDetail(detail, reply)
		patchDetail(detail.id, detailPatch)
		patchItem(detail.id, itemPatch)
	}

	async function loadMore() {
		setLoadingMore(true)
		const request = listRequest.current
		try {
			const page = await loadInboxPage(folder, query, items.length)
			if (request !== listRequest.current) return
			setItems(current => mergeById(current, page.items))
			setHasMore(page.hasMore)
		} catch {
			setError('Could not load more messages')
		} finally {
			setLoadingMore(false)
		}
	}

	async function refresh() {
		if (pollInFlight.current) return
		if (document.visibilityState !== 'visible') return

		pollInFlight.current = true
		const request = ++pollRequest.current
		const detailAt = detailRequest.current
		const listAt = listRequest.current
		const replyAt = replyEpoch.current
		const id = detail?.id ?? null
		const listPending = items.some(
			item => item.lastReplyStatus === 'pending'
		)

		try {
			const [message, page] = await Promise.all([
				id ? refreshMessage(id) : null,
				listPending ? loadInboxPage(folder, query, 0) : null
			])
			if (request !== pollRequest.current) return

			if (
				message &&
				detailAt === detailRequest.current &&
				replyAt === replyEpoch.current
			) {
				setDetail(current =>
					mergeRefreshedDetail(current, message.detail)
				)
				patchItem(message.detail.id, {
					repliedAt: message.detail.repliedAt,
					lastReplyStatus:
						message.detail.replies.at(-1)?.status ?? null
				})
				setCounts(message.counts)
			}
			if (page && listAt === listRequest.current) {
				setItems(current => mergeReplyStatuses(current, page.items))
			}
		} catch {
			return
		} finally {
			pollInFlight.current = false
		}
	}

	function move(offset: 1 | -1) {
		const target = items[selectedIndex + offset]
		if (target) void open(target.id)
	}

	useEffect(() => {
		if (initialDetail && initialDetail.readAt === null) {
			void open(initialDetail.id)
		}
	}, [])

	useEffect(() => {
		if (isFirstList.current) {
			isFirstList.current = false
			return
		}

		const request = ++listRequest.current
		setLoadingList(true)
		setSelectedIds(new Set())
		setConfirmingBulkDelete(false)

		const timer = setTimeout(async () => {
			try {
				const page = await loadInboxPage(folder, query, 0)
				if (request !== listRequest.current) return
				setItems(page.items)
				setHasMore(page.hasMore)
			} catch {
				if (request === listRequest.current) {
					setError('Could not load messages')
				}
			} finally {
				if (request === listRequest.current) setLoadingList(false)
			}
		}, SEARCH_DEBOUNCE_MS)

		return () => clearTimeout(timer)
	}, [folder, query])

	const polling = shouldPoll(detail, items)
	const refreshRef = useRef(refresh)
	refreshRef.current = refresh

	useEffect(() => {
		if (!polling) return

		const timer = setInterval(
			() => void refreshRef.current(),
			POLL_INTERVAL_MS
		)
		function handleVisibility() {
			if (document.visibilityState === 'visible')
				void refreshRef.current()
		}

		document.addEventListener('visibilitychange', handleVisibility)
		return () => {
			clearInterval(timer)
			document.removeEventListener('visibilitychange', handleVisibility)
		}
	}, [polling])

	useEffect(() => {
		const url = new URL(window.location.href)
		if (selectedId) url.searchParams.set('id', selectedId)
		else url.searchParams.delete('id')
		window.history.replaceState(window.history.state, '', url)
	}, [selectedId])

	useEffect(() => {
		if (!confirmingBulkDelete) return
		const timer = setTimeout(
			() => setConfirmingBulkDelete(false),
			CONFIRM_RESET_MS
		)
		return () => clearTimeout(timer)
	}, [confirmingBulkDelete])

	useEffect(() => {
		if (!confirmingDeleteId) return
		const timer = setTimeout(
			() => setConfirmingDeleteId(null),
			CONFIRM_RESET_MS
		)
		return () => clearTimeout(timer)
	}, [confirmingDeleteId])

	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			if (event.metaKey || event.ctrlKey || event.altKey) return
			if (isTyping(event.target)) return

			if (event.key === '/') {
				event.preventDefault()
				searchRef.current?.focus()
			} else if (event.key === 'j') move(1)
			else if (event.key === 'k') move(-1)
			else if (event.key === 'r' && detail) {
				event.preventDefault()
				setComposerOpen(true)
			} else if (event.key === 'e') void toggle('archived')
			else if (event.key === 's') void toggle('starred')
			else if (event.key === 'u') {
				if (detail?.readAt) void toggle('read')
			} else if (event.key === 'Delete' || event.key === '#') {
				void remove()
			} else if (event.key === 'Escape') {
				setSelectedId(null)
				setDetail(null)
			}
		}

		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	})

	const showReader = selectedId !== null

	return (
		<div className="space-y-3">
			{error && (
				<p
					role="alert"
					className="admin-text-xs admin-text-danger rounded-md border border-border px-3 py-2"
				>
					{error}
				</p>
			)}
			<section className="admin-panel grid h-[calc(100dvh-14rem)] min-h-[520px] grid-cols-1 md:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
				<div
					className={
						showReader
							? 'hidden min-h-0 md:flex md:flex-col'
							: 'flex min-h-0 flex-col'
					}
				>
					<MessageList
						items={items}
						selectedId={selectedId}
						selectedIds={selectedIds}
						confirmingBulkDelete={confirmingBulkDelete}
						folder={folder}
						counts={counts}
						query={query}
						loading={loadingList}
						hasMore={hasMore}
						loadingMore={loadingMore}
						searchRef={searchRef}
						onFolderChange={setFolder}
						onQueryChange={setQuery}
						onSelect={id => void open(id)}
						onToggleSelect={toggleSelect}
						onSelectAll={() =>
							setSelectedIds(new Set(items.map(item => item.id)))
						}
						onClearSelection={clearSelection}
						onBulk={action => void runBulk(action)}
						onLoadMore={() => void loadMore()}
					/>
				</div>
				<div
					className={
						showReader
							? 'flex min-h-0 flex-col'
							: 'hidden md:flex md:flex-col'
					}
				>
					<MessageReader
						detail={detail}
						loading={loadingDetail}
						gmail={gmail}
						snippets={snippets}
						hasPrevious={selectedIndex > 0}
						hasNext={
							selectedIndex >= 0 &&
							selectedIndex < items.length - 1
						}
						confirmingDelete={
							detail !== null && confirmingDeleteId === detail.id
						}
						composerOpen={composerOpen}
						onBack={() => {
							setSelectedId(null)
							setDetail(null)
						}}
						onPrevious={() => move(-1)}
						onNext={() => move(1)}
						onToggle={flag => void toggle(flag)}
						onDelete={() => void remove()}
						onComposerChange={setComposerOpen}
						onReplyChanged={applyReply}
					/>
				</div>
			</section>
		</div>
	)
}
