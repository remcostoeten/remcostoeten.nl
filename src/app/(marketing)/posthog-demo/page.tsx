import { PostHogDemo } from '@/components/demo/posthog-demo'

export default function PostHogDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">PostHog Analytics Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates the PostHog analytics integration. Interact with the demo component below to see events being captured.
          </p>
        </div>

        <PostHogDemo />

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <h3 className="font-medium text-foreground">Client-side Tracking:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Page views are automatically captured on route changes</li>
              <li>Button clicks and custom events are tracked using the usePostHog hook</li>
              <li>User identification and feature flags are available client-side</li>
              <li>Session replay is automatically enabled (can be configured)</li>
            </ul>

            <h3 className="font-medium text-foreground">Server-side Tracking:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>API routes can capture events using posthog-node</li>
              <li>Server actions can track business logic events</li>
              <li>Feature flags can be evaluated server-side</li>
              <li>All server events require manual shutdown() to flush</li>
            </ul>

            <h3 className="font-medium text-foreground">Next Steps:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Update your .env.local with your actual PostHog API key</li>
              <li>Check your PostHog dashboard to see captured events</li>
              <li>Add custom events to your existing components and API routes</li>
              <li>Set up feature flags in your PostHog dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'PostHog Demo | Remco Stoeten',
  description: 'Demo page showing PostHog analytics integration',
}