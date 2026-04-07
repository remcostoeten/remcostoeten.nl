import { AnalyticsConfigPanel } from '@/components/admin/analytics/analytics-config-panel'
import { AnalyticsTester } from '@/components/admin/analytics/analytics-tester'

export default function AdminSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground text-sm">
					Configure your site analytics and preferences
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_340px]">
				<div className="space-y-6">
					<AnalyticsTester />
				</div>

				<aside className="space-y-4">
					<AnalyticsConfigPanel />
				</aside>
			</div>
		</div>
	)
}
