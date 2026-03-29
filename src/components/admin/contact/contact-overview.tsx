'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	CheckCircle2,
	Mail,
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
					<StatBox
						value={data.submissions.length}
						label="Sent"
						color="green"
					/>
					<StatBox
						value={data.abandonments.length}
						label="Abandoned"
						color="yellow"
					/>
					<StatBox
						value={data.interactions.length}
						label="Clicks"
						color="blue"
					/>
				</div>

				{/* Recent List */}
				<div className="space-y-4">
					<h4 className="text-sm font-medium text-muted-foreground">
						Recent Submissions
					</h4>
					{data.submissions.slice(0, 5).map(sub => (
						<div
							key={sub.id}
							className="flex items-start gap-3 p-3 rounded-none border bg-muted/50"
						>
							<div className="shrink-0 mt-0.5">
								<CheckCircle2 className="w-4 h-4 text-green-500" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-medium truncate">
										{sub.name}
									</p>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{new Date(
											sub.createdAt
										).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
								<p className="text-xs text-muted-foreground truncate">
									{sub.email}
								</p>
								<p className="text-sm mt-1 line-clamp-2">
									{sub.message}
								</p>
							</div>
						</div>
					))}

					{data.submissions.length === 0 && (
						<div className="text-center py-8 text-muted-foreground text-sm">
							No messages yet
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
