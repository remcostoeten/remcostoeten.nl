'use client'

import { useCallback, useMemo } from 'react'
import { ExternalLink, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MAX_OPEN_AT_ONCE, OPEN_CONFIRM_THRESHOLD } from '../constants'
import type { TLinkExtractorStore } from '../hooks/use-link-extractor-store'
import { openUrls } from '../utils/open'

type Props = {
	store: TLinkExtractorStore
}

export function OpenLinks({ store }: Props) {
	const {
		urls,
		openedUrls,
		openBatchSize,
		setOpenBatchSize,
		markOpened,
		clearOpened
	} = store

	const unopened = useMemo(
		() => urls.filter(url => !openedUrls.has(url)),
		[urls, openedUrls]
	)

	const run = useCallback(
		(batch: string[]) => {
			if (batch.length === 0) {
				toast.info('No links left to open')
				return
			}
			if (
				batch.length > OPEN_CONFIRM_THRESHOLD &&
				!window.confirm(`Open ${batch.length} tabs at once?`)
			) {
				return
			}
			const report = openUrls(batch)
			markOpened(report.opened)
			if (report.blocked > 0) {
				toast.warning(
					`${report.blocked} of ${batch.length} tabs were blocked. Allow pop-ups for this site to open them all.`
				)
				return
			}
			toast.success(
				`Opened ${report.opened.length} link${report.opened.length === 1 ? '' : 's'}`
			)
		},
		[markOpened]
	)

	const batchSize = Math.min(Math.max(openBatchSize, 1), MAX_OPEN_AT_ONCE)

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			<Input
				type="number"
				min={1}
				max={MAX_OPEN_AT_ONCE}
				value={openBatchSize}
				onChange={event =>
					setOpenBatchSize(Number(event.target.value) || 1)
				}
				aria-label="How many links to open at once"
				className="h-7 w-16 rounded-md text-xs"
			/>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				disabled={unopened.length === 0}
				title="Open the next batch of links that have not been opened yet"
				onClick={() => run(unopened.slice(0, batchSize))}
			>
				<ExternalLink aria-hidden className="size-3.5" />
				Open next {Math.min(batchSize, Math.max(unopened.length, 1))}
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				disabled={urls.length === 0}
				title="Open every link in the output"
				onClick={() => run([...urls])}
			>
				<ExternalLink aria-hidden className="size-3.5" />
				Open all {urls.length}
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				disabled={openedUrls.size === 0}
				title="Forget which links were already opened"
				onClick={clearOpened}
			>
				<Eye aria-hidden className="size-3.5" />
				Clear visited
			</Button>
		</div>
	)
}
