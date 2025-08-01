import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import "~/styles/tailwind.css";

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
        <Router
          root={function(props) {
            return (
              <>
                <Suspense>{props.children}</Suspense>
              </>
            );
          }}
        >
          <FileRoutes />
        </Router>
    </QueryClientProvider>
  );
}
