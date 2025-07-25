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
import CMSLinkDemo from "./pages/cms-link-demo";
import ParagraphVariantsDemo from "./pages/paragraph-variants-demo";
import AdminDashboard from "./pages/admin-dashboard";
import { AdminAnalyticsPage } from "./pages/admin/admin-analytics-page";
import DemosIndex from "./pages/demos/index";
import TimezoneDemoPage from "./pages/demos/timezone";
import NumberFlowDemoPage from "./pages/demos/numberflow";
import { KeyboardShortcutsProvider } from "./components/keyboard-shortcuts-provider";
import { KeyboardShortcutIndicator } from "./components/keyboard-shortcut-indicator";
import TextVariantsPage from "./pages/text-variants";

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
              <KeyboardShortcutIndicator />
              <Routes>
{/* Public routes */}
              <Route path="/" element={<Index />} />
              
              {/* Demo routes */}
              <Route path="/demos" element={<DemosIndex />} />
              <Route path="/demos/timezone" element={<TimezoneDemoPage />} />
              <Route path="/demos/numberflow" element={<NumberFlowDemoPage />} />
              
              {/* Other component demos */}
              <Route path="/text-variants" element={<TextVariantsPage />} />
              <Route path="/cms-link-demo" element={<CMSLinkDemo />} />
              <Route path="/paragraph-variants" element={<ParagraphVariantsDemo />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              
              {/* Fallback route */}
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
              </Routes>
            </KeyboardShortcutsProvider>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
