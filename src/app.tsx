import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Suspense, useEffect, useState } from "react";

import { HomePage } from "./components/home-page";
import { AdminCMS } from "./components/admin-cms";
import { TempNavigation } from "./components/temp-navigation";

import { AppLoader } from "./components/effects/app-loader";

function AppContent() {
  const siteConfig = useQuery(api.site.getSiteConfig);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (siteConfig && isInitialLoad) {
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (siteConfig) {
      setShowContent(true);
    }
  }, [siteConfig, isInitialLoad]);

  useEffect(() => {
    if (siteConfig?.title) {
      document.title = siteConfig.title;
    }
    if (siteConfig?.metaDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', siteConfig.metaDescription);
      }
    }
  }, [siteConfig]);

  if (!siteConfig || !showContent) {
    return <AppLoader loadingText="Loading" words={["portfolio", "configuration", "settings", "content", "experience"]} />;
  }

  return (
    <Router>
      <div
        className={`min-h-screen ${siteConfig.bodyBgColor} ${siteConfig.bodyFontSize} ${siteConfig.bodyFont}`}
        style={{
          '--background': siteConfig.customColors?.background || '0 0% 7%',
          '--foreground': siteConfig.customColors?.foreground || '0 0% 85%',
          '--card': siteConfig.customColors?.card || '0 0% 7%',
          '--secondary': siteConfig.customColors?.secondary || '0 0% 12%',
          '--muted': siteConfig.customColors?.muted || '0 0% 12%',
          '--muted-foreground': siteConfig.customColors?.mutedForeground || '0 0% 65%',
          '--accent': siteConfig.customColors?.accent || '85 100% 75%',
          '--border': siteConfig.customColors?.border || '0 0% 20%',
          '--highlight': siteConfig.customColors?.highlightFrontend || '85 100% 75%',
          '--highlight-product': siteConfig.customColors?.highlightProduct || '85 100% 75%',
        } as React.CSSProperties}
      >
        <Suspense fallback={<AppLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/cms" element={<AdminCMS />} />
          </Routes>
          <TempNavigation />
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'white',
              color: '#374151',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    </Router>
  );
}

export function App() {
  return (
    <Suspense fallback={<AppLoader loadingText="Initializing" words={["app", "database", "connection", "resources", "portfolio"]} />}>
      <AppContent />
    </Suspense>
  );
}
