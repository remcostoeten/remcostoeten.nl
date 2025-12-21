'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Globe,
    Activity,
    Map as MapIcon
} from 'lucide-react'

type MetricsProps = {
    totalViews: number
    uniqueVisitors: number
    viewsByCountry: Array<{ country: string | null; count: number }>
    recentViews: Array<{
        ipAddress: string | null
        geoCountry: string | null
        geoCity: string | null
        viewedAt: Date
        slug: string
    }>
}

export function UserMetrics({ data }: { data: MetricsProps }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Geo Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Traffic by Country
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.viewsByCountry.map((item, i) => (
                            <div key={item.country || 'unknown'} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium w-6 text-muted-foreground">#{i + 1}</span>
                                    <span className="text-sm">{item.country || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(item.count / data.totalViews) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-12 text-right">
                                        {item.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Visitor Log */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Live Visitor Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {data.recentViews.map((view, i) => (
                                <div key={i} className="flex flex-col space-y-1 pb-4 border-b last:border-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate max-w-[200px]">
                                            {view.slug.replace('/blog/', '')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(view.viewedAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                                            {view.geoCountry || 'Unknown'}
                                        </Badge>
                                        <span>{view.geoCity}</span>
                                        <span className="ml-auto font-mono opacity-50">
                                            {view.ipAddress?.replace(/\d{1,3}$/, '***')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
