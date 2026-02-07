import { NextResponse } from 'next/server'
import PostHogClient from '@/app/posthog'

export async function POST(request: Request) {
	const posthog = PostHogClient()

	try {
		const data = await request.json()

		// Capture an event
		posthog.capture({
			distinctId: 'user-id', // Replace with actual user ID from auth
			event: 'api_endpoint_called',
			properties: {
				endpoint: '/api/example',
				data: data
			}
		})

		return NextResponse.json({
			success: true,
			message: 'Event captured successfully'
		})
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to capture event' },
			{ status: 500 }
		)
	} finally {
		// IMPORTANT: Always shutdown to flush events
		await posthog.shutdown()
	}
}
