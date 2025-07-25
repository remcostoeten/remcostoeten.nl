import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalyticsProvider } from "./modules/analytics";
// import { AuthProvider } from "./modules/auth/providers/AuthProvider";
// import { ProtectedRoute } from "./modules/auth/components/ProtectedRoute";
// import { LoginForm } from "./modules/auth/components/LoginForm";
// import { DashboardLayout } from "./modules/admin/components/DashboardLayout";
// import { PerformanceDashboard } from "./components/dev/PerformanceDashboard";
import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
import TimezoneDemo from "./pages/timezone-demo";
import NumberFlowTest from "./pages/NumberFlowTest";
// import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
// import { KeyboardShortcutsProvider } from "./components/KeyboardShortcutsProvider";

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
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/timezone-demo" element={<TimezoneDemo />} />
              <Route path="/numberflow-test" element={<NumberFlowTest />} />
              
              {/* Fallback route */}
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
            </Routes>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
