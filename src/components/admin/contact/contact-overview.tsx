'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    CheckCircle2, 
    Mail, 
    XCircle, 
    MousePointer,
    ChevronDown,
    ChevronUp,
    Clock
} from 'lucide-react'

type ContactStats = {
    submissions: any[]
    interactions: any[]
    abandonments: any[]
}

function StatBox({ 
    value, 
    label, 
    color 
}: { 
    value: number
    label: string 
    color: 'green' | 'yellow' | 'blue' 
}) {
    const colors = {
        green: 'text-green-600 bg-green-50 dark:bg-green-950/30',
        yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
    }
    
    return (
        <div className={`rounded-lg p-3 text-center ${colors[color]}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-80">{label}</div>
        </div>
    )
}

function SubmissionItem({ sub }: { sub: any }) {
    const [expanded, setExpanded] = useState(false)
    const isRecent = new Date(sub.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    return (
        <div 
            className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                isRecent ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' : 'bg-muted/30'
            }`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{sub.name}</p>
                            {isRecent && (
                                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                                    New
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="w-3 h-3" />
                            {new Date(sub.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                    <p className={`text-sm mt-2 ${expanded ? '' : 'line-clamp-2'}`}>
                        {sub.message}
                    </p>
                    {sub.message && sub.message.length > 100 && (
                        <button className="text-xs text-primary mt-1 flex items-center gap-1">
                            {expanded ? (
                                <>Show less <ChevronUp className="w-3 h-3" /></>
                            ) : (
                                <>Read more <ChevronDown className="w-3 h-3" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export function ContactOverview({ data }: { data: ContactStats }) {
    const recentSubmissions = data.submissions.filter(
        s => new Date(s.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="w-4 h-4" />
                        Contact Activity
                    </CardTitle>
                    {recentSubmissions.length > 0 && (
                        <Badge variant="default" className="text-xs">
                            {recentSubmissions.length} new
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <StatBox value={data.submissions.length} label="Sent" color="green" />
                    <StatBox value={data.abandonments.length} label="Abandoned" color="yellow" />
                    <StatBox value={data.interactions.length} label="Clicks" color="blue" />
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Recent Messages
                        {recentSubmissions.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        )}
                    </h4>
                    
                    {data.submissions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            No messages yet
                        </div>
                    ) : (
                        <ScrollArea className="h-[250px]">
                            <div className="space-y-2 pr-2">
                                {data.submissions.slice(0, 10).map((sub) => (
                                    <SubmissionItem key={sub.id} sub={sub} />
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
