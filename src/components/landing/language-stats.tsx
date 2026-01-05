'use client'

import { useState, useEffect } from 'react'
import { SiGo, SiPython, SiLua, SiRust, SiZig, SiTypescript, SiJavascript, SiNodedotjs, SiShell } from 'react-icons/si'
import { githubService } from '@/server/services/github'
import { Github } from 'lucide-react'

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
  'Shell': SiShell,
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
          .filter(([name]) => name.toLowerCase() !== 'html')
          .map(([name, data]) => ({
            name,
            count: data.count,
            repos: data.repos,
            percentage: Math.round((data.count / totalRepos) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

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
      <div className="space-y-4 pt-4 pb-8 px-4">
        <div className="h-3 w-72 bg-muted/10 rounded animate-pulse" />
        <div className="flex flex-wrap gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-28 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (languages.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 pt-4 pb-8 px-4">
      <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xl">
        Besides my professional stack, I like to tinker with various tooling and languages.
        Here's what I've been using across my public repositories.
      </p>

      <div className="flex flex-wrap gap-3">
        {languages.map((lang) => {
          const Icon = getLanguageIcon(lang.name)
          const repoList = lang.repos.slice(0, 5).map(r => r.split('/').pop()).join(', ')
          const moreCount = lang.repos.length > 5 ? ` +${lang.repos.length - 5} more` : ''

          return (
            <div
              key={lang.name}
              className="group relative flex items-center gap-2.5 px-3.5 py-2 bg-muted/40 hover:bg-muted/70 rounded-lg transition-colors cursor-default border border-transparent hover:border-border/50"
            >
              <Icon className="w-4 h-4 text-foreground/60 group-hover:text-foreground/80 transition-colors" />
              <span className="text-sm font-medium text-foreground/90">
                {lang.name}
              </span>
              <span className="text-xs text-muted-foreground/50 tabular-nums">
                {lang.count} {lang.count === 1 ? 'repo' : 'repos'}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-popover border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[200px] max-w-[300px]">
                <p className="text-xs font-semibold text-foreground mb-1.5">
                  {lang.name} repositories
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {repoList}{moreCount}
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-border" />
              </div>
            </div>
          )
        })}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 pt-4">
        <Github className="w-3 h-3" />
        <span>Pulled live from GitHub API</span>
      </p>
    </div>
  )
}
