import type { SnippetEntry } from '../types'
import { DebounceDemo } from '@/components/playground/demos/debounce'
import { LocalStorageDemo } from '@/components/playground/demos/local-storage'
import { CopyToClipboardDemo } from '@/components/playground/demos/copy-clipboard'

export const snippetEntries: SnippetEntry[] = [
    {
        id: 'use-debounce',
        title: 'useDebounce Hook',
        description: 'Debounce any value with a custom delay',
        category: 'snippet',
        language: 'ts',
        tags: ['React', 'Hook', 'Utility'],
        code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}`,
    },
    {
        id: 'use-local-storage',
        title: 'useLocalStorage Hook',
        description: 'Persist React state to localStorage with SSR support',
        category: 'snippet',
        language: 'ts',
        tags: ['React', 'Hook', 'Storage'],
        code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function 
      ? value(storedValue) 
      : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue] as const
}`,
    },
    {
        id: 'use-copy-to-clipboard',
        title: 'useCopyToClipboard Hook',
        description: 'Copy text with automatic reset and error handling',
        category: 'snippet',
        language: 'ts',
        tags: ['React', 'Hook', 'Clipboard'],
        code: `function useCopyToClipboard(resetDelay = 2000) {
  const [state, setState] = useState<{
    value?: string
    error?: Error
    copied: boolean
  }>({ copied: false })

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setState({ value: text, copied: true })
      setTimeout(() => setState(s => ({ ...s, copied: false })), resetDelay)
    } catch (error) {
      setState({ error: error as Error, copied: false })
    }
  }, [resetDelay])

  return { ...state, copy }
}`,
    },
]
