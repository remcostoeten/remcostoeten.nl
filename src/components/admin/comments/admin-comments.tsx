'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

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

function renderHeader(recentCount: number) {
    const hasNew = recentCount > 0
    return (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <CardTitle className="text-lg font-medium">Comments</CardTitle>
            </div>
            {hasNew && (
                <Badge variant="default" className="text-xs px-2 py-1" aria-label={`${recentCount} new comments in last 24 hours`}>
                    {recentCount} new
                </Badge>
            )}
        </CardHeader>
    )
}

function renderRows(comments: AdminComment[]) {
    if (comments.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No comments yet.
                </TableCell>
            </TableRow>
        )
    }

    return comments.map((comment) => (
        <TableRow key={comment.id}>
            <TableCell className="max-w-xs truncate">
                <div className="font-medium text-sm">{comment.userName || 'Anonymous'}</div>
                <div className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.isEdited ? ' · edited' : ''}
                </div>
            </TableCell>
            <TableCell className="max-w-md">
                <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
            </TableCell>
            <TableCell className="text-sm">
                <Link
                    href={`/blog/${comment.slug}`}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {comment.slug}
                </Link>
            </TableCell>
            <TableCell className="text-right">
                <Badge variant="secondary">Comment</Badge>
            </TableCell>
        </TableRow>
    ))
}

export function AdminComments({ comments, recentCount }: AdminCommentsProps) {
    return (
        <Card>
            {renderHeader(recentCount)}
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Post</TableHead>
                            <TableHead className="text-right">Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderRows(comments)}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
