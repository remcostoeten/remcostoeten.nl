import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalyticsProvider } from "./modules/analytics";
import { AuthProvider } from "./modules/auth/providers/AuthProvider";
import { ProtectedRoute } from "./modules/auth/components/ProtectedRoute";
import { LoginForm } from "./modules/auth/components/LoginForm";
import { DashboardLayout } from "./modules/admin/components/DashboardLayout";
import { PerformanceDashboard } from "./components/dev/PerformanceDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TimezoneDemo from "./pages/timezone-demo";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { KeyboardShortcutsProvider } from "./components/KeyboardShortcutsProvider";

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
          <AuthProvider>
            <AnalyticsProvider>
              <KeyboardShortcutsProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/timezone-demo" element={<TimezoneDemo />} />
                  
                  {/* Admin authentication */}
                  <Route path="/admin/login" element={<LoginForm />} />
                  
                  {/* Protected admin routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminAnalyticsPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                    <Route path="cms" element={<div>CMS Coming Soon...</div>} />
                    <Route path="settings" element={<div>Settings Coming Soon...</div>} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </KeyboardShortcutsProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </BrowserRouter>
        <PerformanceDashboard />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
