"use client"

import { SiteAnnouncementBanner } from "@/components/announcement-banner"

export default function TestAnnouncementPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Test Announcement Banner</h1>

      <div className="space-y-8">
        <div className="p-4 border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>The announcement banner should appear at the top after 2 seconds</li>
            <li>You can drag it up to dismiss it</li>
            <li>Scrolling down past 300px will hide it</li>
            <li>Scrolling back to top will show it again</li>
            <li>Clicking the X button will dismiss it permanently</li>
            <li>The dismissal state is saved to localStorage</li>
          </ul>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Area</h2>
          <p className="mb-8">Scroll down to test the hide-on-scroll functionality</p>

          {/* Generate scrollable content */}
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 mb-4 bg-muted rounded-lg">
              <h3 className="font-medium">Section {i + 1}</h3>
              <p className="text-sm text-muted-foreground">
                This is scrollable content to test the announcement banner hide-on-scroll functionality.
                Keep scrolling to see how the banner behaves.
              </p>
            </div>
          ))}
        </div>
      </div>

      <SiteAnnouncementBanner />
    </div>
  )
}