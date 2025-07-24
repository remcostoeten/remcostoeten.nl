import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalyticsProvider } from "./modules/analytics";
import { PerformanceDashboard } from "./components/dev/PerformanceDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TimezoneDemo from "./pages/timezone-demo";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Reduce cache time to prevent memory buildup
        gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
        staleTime: 1 * 60 * 1000, // 1 minute
        // Don't retry on errors to reduce server load
        retry: 1,
        // Don't refetch on window focus to reduce unnecessary requests
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect unless stale
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Reduce mutation cache time
        gcTime: 2 * 60 * 1000, // 2 minutes
      },
    },
  });
}

const queryClient = createQueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/timezone-demo" element={<TimezoneDemo />} />
              <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnalyticsProvider>
        </BrowserRouter>
        <PerformanceDashboard />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
