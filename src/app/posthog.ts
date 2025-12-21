import { PostHog } from 'posthog-node'

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1, // Flush immediately
    flushInterval: 0, // No batching delay
  })
  return posthogClient
}