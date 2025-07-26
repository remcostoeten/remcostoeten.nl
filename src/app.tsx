import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import "./app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      experimental_prefetchInRender: true,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        root={props => (
          <Suspense>{props.children}</Suspense>
        )}
      >
        <FileRoutes />
      </Router>
    </QueryClientProvider>
  );
}
