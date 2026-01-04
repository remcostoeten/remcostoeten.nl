'use client'

import { useState, useEffect } from 'react'
import { SiGo, SiPython, SiLua, SiRust, SiZig, SiTypescript, SiJavascript, SiNodedotjs } from 'react-icons/si'
import { githubService } from '@/server/services/github'
import { cn } from '@/lib/utils'

type Language = {
  name: string
  count: number
  repos: string[]
  percentage: number
}

const LANGUAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Go': SiGo,
  'Python': SiPython,
  'Lua': SiLua,
  'Rust': SiRust,
  'Zig': SiZig,
  'TypeScript': SiTypescript,
  'JavaScript': SiJavascript,
  'Node.js': SiNodedotjs,
}

const getLanguageIcon = (language: string): React.ComponentType<{ className?: string }> => {
  const normalizedLang = language.toLowerCase()
  const iconKey = Object.keys(LANGUAGE_ICONS).find(key => normalizedLang === key.toLowerCase())

  return iconKey ? LANGUAGE_ICONS[iconKey] : SiTypescript
}

export function LanguageStats() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languageMap = await githubService.getLanguageStats()

        const totalRepos = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.count, 0)

        const sortedLanguages = Array.from(languageMap.entries())
          .map(([name, data]) => ({
            name,
            count: data.count,
            repos: data.repos,
            percentage: Math.round((data.count / totalRepos) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)

        setLanguages(sortedLanguages)
      } catch (error) {
        console.error('Error fetching language stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-4 w-16 bg-muted/20 rounded animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (languages.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 py-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Languages
      </h3>

      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => {
          const Icon = getLanguageIcon(lang.name)

          return (
            <a
              key={lang.name}
              href={`https://github.com/${lang.repos[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon className="w-4 h-4 text-foreground/70" />
              <span className="text-xs font-medium text-foreground">
                {lang.name}
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                {lang.count}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
