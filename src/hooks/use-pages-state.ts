import { useReducer, useCallback, useEffect } from 'react'
import { Page } from '@/types/cms'
import { createNewPage, generateId, generateSlug } from '@/utils/cms-data'
import { TPageContent } from '@/lib/cms/types'
import { cmsApiClient } from '@/lib/cms/api-client'

// Action types
type PagesAction = 
  | { type: 'SET_PAGES'; payload: Page[] }
  | { type: 'ADD_PAGE'; payload: Page }
  | { type: 'UPDATE_PAGE'; payload: { id: string; page: Page } }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: Page | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }

// State type
interface PagesState {
  pages: Page[]
  currentPage: Page | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: PagesState = {
  pages: [],
  currentPage: null,
  isLoading: false,
  error: null
}

// Reducer function
function pagesReducer(state: PagesState, action: PagesAction): PagesState {
  switch (action.type) {
    case 'SET_PAGES':
      return { ...state, pages: action.payload, error: null }
    case 'ADD_PAGE':
      return { ...state, pages: [...state.pages, action.payload], error: null }
    case 'UPDATE_PAGE':
      return {
        ...state,
        pages: state.pages.map(page => 
          page.id === action.payload.id ? action.payload.page : page
        ),
        error: null
      }
    case 'DELETE_PAGE':
      return {
        ...state,
        pages: state.pages.filter(page => page.id !== action.payload),
        currentPage: state.currentPage?.id === action.payload ? null : state.currentPage,
        error: null
      }
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

// Storage utilities
class PagesStorage {
  private static readonly STORAGE_KEY = 'cms_pages'
  private static readonly HOME_PAGE_KEY = 'home_page'

  static getPages(): Page[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const pages = JSON.parse(stored)
      return pages.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt),
      }))
    } catch {
      return []
    }
  }

  static savePages(pages: Page[]): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pages))
    
    // Update home page cache
    const homePage = pages.find(p => p.slug === 'home' && p.isPublished)
    if (homePage) {
      localStorage.setItem(this.HOME_PAGE_KEY, JSON.stringify(homePage))
    }
  }

  static clearAll(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.HOME_PAGE_KEY)
  }
}

// Main hook
export function usePagesState() {
  const [state, dispatch] = useReducer(pagesReducer, initialState)

  // Load pages from localStorage on mount
  useEffect(() => {
    const loadPages = () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        const storedPages = PagesStorage.getPages()
        dispatch({ type: 'SET_PAGES', payload: storedPages })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load pages' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadPages()
  }, [])

  // Save pages to localStorage whenever pages change
  useEffect(() => {
    if (state.pages.length > 0) {
      PagesStorage.savePages(state.pages)
    }
  }, [state.pages])

  // Actions
  const actions = {
    // Create a new page
    createPage: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' })
      
      try {
        const baseNewPage = createNewPage()
        const newPage: Page = {
          ...baseNewPage,
          id: generateId(),
          slug: generateSlug(baseNewPage.title),
        }
        
        dispatch({ type: 'ADD_PAGE', payload: newPage })
        dispatch({ type: 'SET_CURRENT_PAGE', payload: newPage })
        
        return newPage
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create page' })
        throw error
      }
    }, []),

    // Create homepage
    createHomepage: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' })
      
      try {
        const homePage: Page = {
          id: generateId(),
          title: 'Home',
          slug: 'home',
          description: 'Welcome to my website',
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          blocks: []
        }
        
        dispatch({ type: 'ADD_PAGE', payload: homePage })
        
        return homePage
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create homepage' })
        throw error
      }
    }, []),

    // Update a page
    updatePage: useCallback(async (pageId: string, updatedPage: Page) => {
      dispatch({ type: 'CLEAR_ERROR' })
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        // Save to database via API
        const pageContent: TPageContent = {
          blocks: updatedPage.blocks.map(block => ({
            ...block,
            blockType: block.type,
            segments: block.content
          }))
        }
        
        await cmsApiClient.updatePage(updatedPage.slug, pageContent)
        
        // Update local state
        dispatch({ type: 'UPDATE_PAGE', payload: { id: pageId, page: updatedPage } })
        dispatch({ type: 'SET_CURRENT_PAGE', payload: null })
        
        return updatedPage
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save page' })
        throw error
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }, []),

    // Delete a page
    deletePage: useCallback((pageId: string) => {
      dispatch({ type: 'CLEAR_ERROR' })
      
      try {
        dispatch({ type: 'DELETE_PAGE', payload: pageId })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete page' })
        throw error
      }
    }, []),

    // Set current page for editing
    setCurrentPage: useCallback((page: Page | null) => {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page })
    }, []),

    // Refresh all data
    refreshData: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' })
      
      try {
        PagesStorage.clearAll()
        
        // Create default homepage
        const homePage: Page = {
          id: generateId(),
          title: 'Home',
          slug: 'home',
          description: 'Welcome to my website',
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          blocks: []
        }
        
        dispatch({ type: 'SET_PAGES', payload: [homePage] })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' })
        throw error
      }
    }, []),

    // Clear error
    clearError: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' })
    }, [])
  }

  // Computed values
  const computed = {
    totalPages: state.pages.length,
    hasHomepage: state.pages.some(p => p.slug === 'home'),
    publishedPages: state.pages.filter(p => p.isPublished),
    pageCountText: `${state.pages.length} ${state.pages.length === 1 ? 'page' : 'pages'}`
  }

  return {
    ...state,
    actions,
    computed
  }
}

// Hook for persisting state to localStorage
export function usePersistentState() {
  const saveToStorage = useCallback((key: string, value: any) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [])

  const loadFromStorage = useCallback((key: string, defaultValue: any = null) => {
    if (typeof window === 'undefined') return defaultValue
    
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return defaultValue
    }
  }, [])

  const removeFromStorage = useCallback((key: string) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }, [])

  return {
    saveToStorage,
    loadFromStorage,
    removeFromStorage
  }
}
