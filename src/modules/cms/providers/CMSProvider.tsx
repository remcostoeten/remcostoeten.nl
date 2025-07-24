import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureCMS } from '../hooks/useCMS';
import { useSiteSettings } from '../hooks/useCMS';

interface CMSConfig {
  baseUrl: string;
  apiKey: string;
  previewMode?: boolean;
}

interface CMSContextType {
  config: CMSConfig | null;
  isConfigured: boolean;
}

const CMSContext = createContext<CMSContextType>({
  config: null,
  isConfigured: false,
});

interface CMSProviderProps {
  children: ReactNode;
  config?: CMSConfig;
  queryClient?: QueryClient;
}

// Create a default query client if none provided
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

export function CMSProvider({ 
  children, 
  config,
  queryClient = defaultQueryClient 
}: CMSProviderProps) {
  const [cmsConfig, setCmsConfig] = React.useState<CMSConfig | null>(config || null);

  useEffect(() => {
    if (cmsConfig) {
      configureCMS(cmsConfig.baseUrl, cmsConfig.apiKey);
    }
  }, [cmsConfig]);

  const contextValue: CMSContextType = {
    config: cmsConfig,
    isConfigured: !!cmsConfig,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CMSContext.Provider value={contextValue}>
        {children}
      </CMSContext.Provider>
    </QueryClientProvider>
  );
}

export function useCMSContext() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
}

// HOC for components that need CMS configuration
export const withCMS = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType
) => {
  const WithCMSComponent: React.FC<P> = (props) => {
    const { isConfigured } = useCMSContext();

    if (!isConfigured && fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent />;
    }

    return <WrappedComponent {...props} />;
  };

  return WithCMSComponent;
};

// Theme provider that uses CMS settings
export function CMSThemeProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.data.theme) {
      const theme = settings.data.theme;
      const root = document.documentElement;
      
      root.style.setProperty('--cms-primary', theme.primaryColor);
      root.style.setProperty('--cms-secondary', theme.secondaryColor);
      root.style.setProperty('--cms-accent', theme.accentColor);
      
      if (theme.mode === 'dark') {
        root.classList.add('dark');
      } else if (theme.mode === 'light') {
        root.classList.remove('dark');
      }
    }
  }, [settings]);

  return <>{children}</>;
}
