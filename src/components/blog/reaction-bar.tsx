'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { toggleReaction } from '@/server/actions/blog/reactions'
import type { EmojiType } from '@/server/db/schema'
import posthog from 'posthog-js'

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

		const wasReacted = reactions[emoji].hasReacted

		posthog.capture('blog_post_reaction', {
			slug: slug,
			emoji_type: emoji,
			emoji_label: EMOJI_CONFIG[emoji].label,
			action: wasReacted ? 'removed' : 'added'
		})

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
		<div className="mt-12 mb-8">
			<div className="flex items-center gap-2 flex-wrap">
				<span className="text-sm text-zinc-500 mr-2">React:</span>
				{(Object.keys(EMOJI_CONFIG) as EmojiType[]).map(emoji => (
					<motion.button
						key={emoji}
						onClick={() => handleReaction(emoji)}
						disabled={isPending && loadingEmoji === emoji}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            border transition-all duration-200
                            ${
								reactions[emoji].hasReacted
									? 'bg-zinc-800 border-zinc-600 text-white'
									: 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
							}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
						title={EMOJI_CONFIG[emoji].label}
					>
						<span className="text-base">
							{EMOJI_CONFIG[emoji].emoji}
						</span>
						{reactions[emoji].count > 0 && (
							<span className="text-xs font-medium">
								{reactions[emoji].count}
							</span>
						)}
					</motion.button>
				))}
			</div>
		</div>
	)
}
