'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, MessageSquare, Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import Image from 'next/image'
import { addComment, deleteComment, getComments } from '@/actions/comments'
import { SignInButton } from './sign-in-button'
import posthog from 'posthog-js'

type Comment = {
    id: string
    content: string
    parentId: string | null
    isEdited: boolean
    createdAt: Date
    userId: string
    userName: string | null
    userImage: string | null
}

type Props = {
    slug: string
}

export function CommentSection({ slug }: Props) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadComments() {
            setIsLoading(true)
            const result = await getComments(slug)
            setComments(result.comments as Comment[])
            setIsLoading(false)
        }
        loadComments()
    }, [slug])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newComment.trim() || !session?.user) return

        setError(null)

        startTransition(async () => {
            const result = await addComment(slug, newComment)

            if (result.error) {
                setError(result.error)
            } else {
                // Track comment submitted event
                posthog.capture('blog_comment_submitted', {
                    slug: slug,
                    comment_length: newComment.length,
                })

                setNewComment('')
                const fresh = await getComments(slug)
                setComments(fresh.comments as Comment[])
            }
        })
    }

    async function handleDelete(commentId: string) {
        startTransition(async () => {
            const result = await deleteComment(commentId)

            if (!result.error) {
                // Track comment deleted event
                posthog.capture('blog_comment_deleted', {
                    slug: slug,
                    comment_id: commentId,
                })

                setComments(prev => prev.filter(c => c.id !== commentId))
            }
        })
    }

    function formatDistanceToNow(date: Date) {
        return date.toDateString()
    }

    return (
        <div className="mt-16 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 mb-8">
                <MessageSquare className="w-5 h-5 text-zinc-400" />
                <h2 className="text-xl font-semibold text-white">
                    Comments {comments.length > 0 && `(${comments.length})`}
                </h2>
            </div>

            {session?.user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-3">
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                <span className="text-sm font-medium text-zinc-400">
                                    {session.user.name?.[0]?.toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                rows={3}
                                maxLength={2000}
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-none AAAA
                                    text-white placeholder-zinc-500 resize-none
                                    focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600
                                    transition-colors"
                            />
                            {error && (
                                <p className="mt-2 text-sm text-destructive">{error}</p>
                            )}
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-xs text-zinc-500">
                                    {newComment.length}/2000
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isPending}
                                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-900 
                                        font-medium rounded-none AAAA transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        flex items-center gap-2"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-none AAAA text-center">
                    <p className="text-zinc-400 mb-4">Sign in to join the conversation</p>
                    <SignInButton />
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-zinc-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex gap-3"
                            >
                                {comment.userImage ? (
                                    <Image
                                        src={comment.userImage}
                                        alt={comment.userName || 'User'}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-medium text-zinc-400">
                                            {comment.userName?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-white">
                                            {comment.userName || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {formatDistanceToNow(new Date(comment.createdAt))}
                                        </span>
                                        {comment.isEdited && (
                                            <span className="text-xs text-zinc-600">(edited)</span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-zinc-300 whitespace-pre-wrap wrap-break-word">
                                        {comment.content}
                                    </p>

                                    {session?.user?.id === comment.userId && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={isPending}
                                            className="mt-2 text-xs text-zinc-500 hover:text-red-400 
                                                transition-colors flex items-center gap-1
                                                disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
