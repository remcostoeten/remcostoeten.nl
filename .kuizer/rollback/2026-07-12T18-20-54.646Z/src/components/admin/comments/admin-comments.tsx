'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import {
	MessageSquare,
	ExternalLink,
	Clock,
	User,
	ChevronDown,
	ChevronUp
} from 'lucide-react'

type AdminComment = {
	id: string
	slug: string
	content: string
	createdAt: string
	userName: string | null
	userImage: string | null
	isEdited: boolean
}

type AdminCommentsProps = {
	comments: AdminComment[]
	recentCount: number
}

function CommentCard({ comment }: { comment: AdminComment }) {
	const [expanded, setExpanded] = useState(false)
	const isNew =
		new Date(comment.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)

	return (
		<div
			className={`p-3 rounded-lg border transition-colors ${
				isNew
					? 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20'
					: 'bg-muted/30'
			}`}
		>
			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex items-center gap-2 min-w-0">
					{comment.userImage ? (
						<img
							src={comment.userImage}
							alt={comment.userName || ''}
							className="w-6 h-6 rounded-full"
						/>
					) : (
						<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
							<User className="w-3 h-3 text-muted-foreground" />
						</div>
					)}
					<span className="text-sm font-medium truncate">
						{comment.userName || 'Anonymous'}
					</span>
					{isNew && (
						<Badge
							variant="secondary"
							className="text-[10px] bg-blue-100 text-blue-700"
						>
							New
						</Badge>
					)}
					{comment.isEdited && (
						<span className="text-[10px] text-muted-foreground">
							(edited)
						</span>
					)}
				</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
					<Clock className="w-3 h-3" />
					{new Date(comment.createdAt).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					})}
				</div>
			</div>

			<p
				className={`text-sm text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}
				onClick={() =>
					comment.content.length > 100 && setExpanded(!expanded)
				}
			>
				{comment.content}
			</p>

			{comment.content.length > 100 && (
				<button
					onClick={() => setExpanded(!expanded)}
					className="text-xs text-primary mt-1 flex items-center gap-1"
				>
					{expanded ? (
						<>
							Show less <ChevronUp className="w-3 h-3" />
						</>
					) : (
						<>
							Read more <ChevronDown className="w-3 h-3" />
						</>
					)}
				</button>
			)}

			<div className="flex items-center justify-between mt-3 pt-2 border-t">
				<Link
					href={`/blog/${comment.slug}`}
					target="_blank"
					className="text-xs text-primary hover:underline flex items-center gap-1"
				>
					{comment.slug}
					<ExternalLink className="w-3 h-3" />
				</Link>
			</div>
		</div>
	)
}

export function AdminComments({ comments, recentCount }: AdminCommentsProps) {
	const [showAll, setShowAll] = useState(false)
	const visibleComments = showAll ? comments : comments.slice(0, 5)

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base">
						<MessageSquare className="w-4 h-4" />
						Comments
					</CardTitle>
					{recentCount > 0 && (
						<Badge variant="default" className="text-xs">
							{recentCount} new
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{comments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground text-sm">
						No comments yet
					</div>
				) : (
					<>
						<ScrollArea
							className={showAll ? 'h-[400px]' : 'h-auto'}
						>
							<div className="space-y-3 pr-2">
								{visibleComments.map(comment => (
									<CommentCard
										key={comment.id}
										comment={comment}
									/>
								))}
							</div>
						</ScrollArea>

						{comments.length > 5 && (
							<button
								onClick={() => setShowAll(!showAll)}
								className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
							>
								{showAll ? (
									<>
										Show less{' '}
										<ChevronUp className="w-3 h-3" />
									</>
								) : (
									<>
										View all {comments.length} comments{' '}
										<ChevronDown className="w-3 h-3" />
									</>
								)}
							</button>
						)}
					</>
				)}
			</CardContent>
		</Card>
	)
}
