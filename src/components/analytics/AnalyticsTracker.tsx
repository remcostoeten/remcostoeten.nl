import { useTrackPageView } from '~/hooks/use-track-page-view'

type TProps = {
  userId?: string
  sessionId?: string
  debounceMs?: number
}

export function AnalyticsTracker(props: TProps) {
  useTrackPageView({
    userId: props.userId,
    sessionId: props.sessionId,
    debounceMs: props.debounceMs
  })

  // This component doesn't render anything visible
  return null
}
