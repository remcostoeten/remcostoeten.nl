'use client'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Eye, Clock, Calendar, ExternalLink } from 'lucide-react'

type BlogPost = {
    slug: string
    metadata: {
        title: string
        publishedAt: string
        draft?: boolean
        readTime?: string
    }
    totalViews: number
    uniqueViews: number
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.slug}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="truncate max-w-[200px] md:max-w-xs" title={post.metadata.title}>
                                            {post.metadata.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> {post.metadata.readTime || 'N/A'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={post.metadata.draft ? "secondary" : "default"}>
                                        {post.metadata.draft ? 'Draft' : 'Published'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Eye className="w-3 h-3 text-muted-foreground" /> {post.totalViews}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            ({post.uniqueViews} unique)
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        target="_blank"
                                        className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
