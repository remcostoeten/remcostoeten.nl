'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { usePagesState } from '@/hooks/use-pages-state'
import { Page } from '@/types/cms'

// Context types
interface CMSContextType {
  // State
  pages: Page[]
  currentPage: Page | null
  isLoading: boolean
  error: string | null
  
  // Actions
  actions: {
    createPage: () => Page
    createHomepage: () => Page
    updatePage: (pageId: string, page: Page) => Promise<Page>
    deletePage: (pageId: string) => void
    setCurrentPage: (page: Page | null) => void
    refreshData: () => void
    clearError: () => void
  }
  
  // Computed values
  computed: {
    totalPages: number
    hasHomepage: boolean
    publishedPages: Page[]
    pageCountText: string
  }
}

// Create context
const CMSContext = createContext<CMSContextType | undefined>(undefined)

// Provider component
interface CMSProviderProps {
  children: ReactNode
}

export function CMSProvider({ children }: CMSProviderProps) {
  const pagesState = usePagesState()
  
  return (
    <CMSContext.Provider value={pagesState}>
      {children}
    </CMSContext.Provider>
  )
}

// Custom hook to use the CMS context
export function useCMS() {
  const context = useContext(CMSContext)
  
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider')
  }
  
  return context
}

// HOC for components that need CMS state
export function withCMS<P extends object>(Component: React.ComponentType<P>) {
  return function CMSComponent(props: P) {
    return (
      <CMSProvider>
        <Component {...props} />
      </CMSProvider>
    )
  }
}

// Utility hooks for specific use cases
export function usePageManagement() {
  const { actions, computed } = useCMS()
  
  return {
    createPage: actions.createPage,
    createHomepage: actions.createHomepage,
    updatePage: actions.updatePage,
    deletePage: actions.deletePage,
    refreshData: actions.refreshData,
    ...computed
  }
}

export function usePageEditor() {
  const { currentPage, actions, isLoading, error } = useCMS()
  
  return {
    currentPage,
    setCurrentPage: actions.setCurrentPage,
    updatePage: actions.updatePage,
    isLoading,
    error,
    clearError: actions.clearError
  }
}

export function usePagesList() {
  const { pages, actions, computed, isLoading, error } = useCMS()
  
  return {
    pages,
    isLoading,
    error,
    onEdit: actions.setCurrentPage,
    onCreate: actions.createPage,
    onCreateHomepage: actions.createHomepage,
    onDelete: actions.deletePage,
    onRefresh: actions.refreshData,
    ...computed
  }
}

// Selectors for optimized re-renders
export function usePageById(pageId: string) {
  const { pages } = useCMS()
  return pages.find(page => page.id === pageId) || null
}

export function usePublishedPages() {
  const { computed } = useCMS()
  return computed.publishedPages
}

export function useHomePage() {
  const { pages } = useCMS()
  return pages.find(page => page.slug === 'home' && page.isPublished) || null
}

// Error boundary for CMS components
interface CMSErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface CMSErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class CMSErrorBoundary extends React.Component<CMSErrorBoundaryProps, CMSErrorBoundaryState> {
  constructor(props: CMSErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): CMSErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CMS Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              An error occurred while loading the CMS. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component that provides both context and error boundary
export function CMSWrapper({ children }: { children: ReactNode }) {
  return (
    <CMSErrorBoundary>
      <CMSProvider>
        {children}
      </CMSProvider>
    </CMSErrorBoundary>
  )
}
