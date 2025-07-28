import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import KeyboardShortcutsProvider from "~/components/providers/KeyboardShortcutsProvider";
import KeyboardShortcutIndicator from "~/components/ui/KeyboardShortcutIndicator";
import { AnalyticsTracker } from "~/components/analytics/AnalyticsTracker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      experimental_prefetchInRender: true,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardShortcutsProvider>
        <Router
          root={function(props) {
            return (
              <>
                <AnalyticsTracker />
                <Suspense>{props.children}</Suspense>
                <KeyboardShortcutIndicator />
              </>
            );
          }}
        >
          <FileRoutes />
        </Router>
      </KeyboardShortcutsProvider>
    </QueryClientProvider>
  );
}
