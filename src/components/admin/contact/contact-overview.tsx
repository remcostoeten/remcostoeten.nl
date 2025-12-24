'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Mail } from 'lucide-react'


type ContactStats = {
    submissions: any[]
    interactions: any[]
    abandonments: any[]
}

export function ContactOverview({ data }: { data: ContactStats }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contact Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center pb-6 border-b">
                        <div>
                            <div className="text-2xl font-bold">{data.submissions.length}</div>
                            <div className="text-xs text-muted-foreground">Sent</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.abandonments.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Abandoned</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {data.interactions.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Clicks</div>
                        </div>
                    </div>

                    {/* Recent List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Recent Submissions</h4>
                        {data.submissions.slice(0, 5).map((sub) => (
                            <div key={sub.id} className="flex items-start gap-3 p-3 rounded-none AAAA border bg-muted/50">
                                <div className="shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium truncate">{sub.name}</p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                                    <p className="text-sm mt-1 line-clamp-2">{sub.message}</p>
                                </div>
                            </div>
                        ))}

                        {data.submissions.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No messages yet
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
