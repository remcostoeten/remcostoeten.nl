'use client'

import { usePostHog } from 'posthog-js/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

export function PostHogDemo() {
  const posthog = usePostHog()
  const [clickCount, setClickCount] = useState(0)

  const handleButtonClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)

    // Capture a custom event
    posthog.capture('demo_button_clicked', {
      click_count: newCount,
      button_text: 'Click me!',
      timestamp: new Date().toISOString(),
    })
  }

  const handleIdentifyUser = () => {
    // Identify a user (in a real app, you'd use actual user data)
    posthog.identify('demo-user-123', {
      email: 'demo@example.com',
      name: 'Demo User',
      plan: 'free',
    })

    posthog.capture('user_identified', {
      method: 'demo',
    })
  }

  const handleResetUser = () => {
    // Reset user identification
    posthog.reset()
    setClickCount(0)
    posthog.capture('user_reset', {
      method: 'demo',
    })
  }

  const testFeatureFlag = () => {
    // Test if a feature flag is enabled
    const isEnabled = posthog.isFeatureEnabled('demo-feature')

    posthog.capture('feature_flag_checked', {
      feature: 'demo-feature',
      enabled: isEnabled,
    })

    alert(`Feature 'demo-feature' is ${isEnabled ? 'enabled' : 'disabled'}`)
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">PostHog Demo</h3>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Button clicked: <span className="font-mono">{clickCount}</span> times
        </p>

        <Button onClick={handleButtonClick} className="w-full">
          Click me! (Event tracked)
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">User Identification</h4>
        <div className="flex gap-2">
          <Button onClick={handleIdentifyUser} variant="outline" size="sm">
            Identify User
          </Button>
          <Button onClick={handleResetUser} variant="outline" size="sm">
            Reset User
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Feature Flags</h4>
        <Button onClick={testFeatureFlag} variant="outline" size="sm">
          Test Feature Flag
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Open your browser console and PostHog dashboard to see the events being captured.
      </div>
    </Card>
  )
}