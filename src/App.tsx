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
import { KeyboardShortcutsProvider } from "./components/keyboard-shortcuts-provider";
import { KeyboardShortcutIndicator } from "./components/keyboard-shortcut-indicator";

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
            <KeyboardShortcutsProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/timezone-demo" element={<TimezoneDemo />} />
                <Route path="/numberflow-test" element={<NumberFlowTest />} />
                
                {/* Admin routes (for testing keyboard shortcuts) */}
                <Route path="/admin" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
                      <p className="text-gray-600 mb-4">This is the admin area.</p>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="font-semibold mb-2">Keyboard Shortcuts:</h2>
                        <ul className="text-sm text-left space-y-1">
                          <li><kbd className="bg-gray-200 px-2 py-1 rounded">⎵ ⎵ ⎵ 0</kbd> - Go to Home</li>
                          <li><kbd className="bg-gray-200 px-2 py-1 rounded">⎵ ⎵ ⎵ 1</kbd> - Go to Admin</li>
                          <li><kbd className="bg-gray-200 px-2 py-1 rounded">⎵ ⎵ ⎵ 2</kbd> - Go to Analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/admin/analytics" element={
                  <div className="min-h-screen flex items-center justify-center bg-blue-100">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold mb-4">Admin Analytics</h1>
                      <p className="text-gray-600 mb-4">Analytics dashboard for admin users.</p>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="font-semibold mb-2">Try the shortcuts:</h2>
                        <ul className="text-sm text-left space-y-1">
                          <li><kbd className="bg-gray-200 px-2 py-1 rounded">⎵ ⎵ ⎵ 0</kbd> - Go to Home</li>
                          <li><kbd className="bg-gray-200 px-2 py-1 rounded">⎵ ⎵ ⎵ 1</kbd> - Go to Admin Dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
              </Routes>
              <KeyboardShortcutIndicator />
            </KeyboardShortcutsProvider>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
