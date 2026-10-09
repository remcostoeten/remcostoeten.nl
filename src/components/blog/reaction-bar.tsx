'use client'

import { useState, useEffect, useTransition } from 'react'
import * as m from 'motion/react-m'
import { toggleReaction } from '@/server/actions/blog/reactions'
import type { EmojiType } from '@/server/db/schema'

const EMOJI_CONFIG: Record<EmojiType, { emoji: string; label: string }> = {
	fire: { emoji: '🔥', label: 'Fire' },
	heart: { emoji: '❤️', label: 'Love' },
	clap: { emoji: '👏', label: 'Clap' },
	thinking: { emoji: '🤔', label: 'Thinking' },
	rocket: { emoji: '🚀', label: 'Rocket' }
}

interface ReactionData {
	count: number
	hasReacted: boolean
}

interface ReactionBarProps {
	slug: string
}

export function ReactionBar({ slug }: ReactionBarProps) {
	const [reactions, setReactions] = useState<Record<EmojiType, ReactionData>>(
		{
			fire: { count: 0, hasReacted: false },
			heart: { count: 0, hasReacted: false },
			clap: { count: 0, hasReacted: false },
			thinking: { count: 0, hasReacted: false },
			rocket: { count: 0, hasReacted: false }
		}
	)
	const [isPending, startTransition] = useTransition()
	const [loadingEmoji, setLoadingEmoji] = useState<EmojiType | null>(null)

	useEffect(() => {
		async function loadReactions() {
			const response = await fetch(
				`/api/blog/reactions?slug=${encodeURIComponent(slug)}`,
				{ cache: 'no-store' }
			)
			const result = await response.json()
			if (result.reactions) {
				setReactions(result.reactions)
			}
		}
		loadReactions()
	}, [slug])

	const handleReaction = async (emoji: EmojiType) => {
		setLoadingEmoji(emoji)

		setReactions(prev => ({
			...prev,
			[emoji]: {
				count: prev[emoji].hasReacted
					? prev[emoji].count - 1
					: prev[emoji].count + 1,
				hasReacted: !prev[emoji].hasReacted
			}
		}))

		startTransition(async () => {
			const result = await toggleReaction(slug, emoji)

			if (result.error) {
				const response = await fetch(
					`/api/blog/reactions?slug=${encodeURIComponent(slug)}`,
					{ cache: 'no-store' }
				)
				const fresh = await response.json()
				if (fresh.reactions) {
					setReactions(fresh.reactions)
				}
			}

			setLoadingEmoji(null)
		})
	}

	return (
		<div className="mt-14 flex flex-wrap items-center gap-2 border-t border-border/60 pt-8">
			{(Object.keys(EMOJI_CONFIG) as EmojiType[]).map(emoji => (
				<m.button
					key={emoji}
					onClick={() => handleReaction(emoji)}
					disabled={isPending && loadingEmoji === emoji}
					whileTap={{ scale: 0.95 }}
					aria-pressed={reactions[emoji].hasReacted}
					className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
						reactions[emoji].hasReacted
							? 'border-foreground/30 bg-muted text-foreground'
							: 'border-border/60 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground'
					}`}
					title={EMOJI_CONFIG[emoji].label}
				>
					<span className="text-base leading-none">
						{EMOJI_CONFIG[emoji].emoji}
					</span>
					{reactions[emoji].count > 0 && (
						<span className="font-mono text-xs tabular-nums">
							{reactions[emoji].count}
						</span>
					)}
				</m.button>
			))}
		</div>
	)
}
