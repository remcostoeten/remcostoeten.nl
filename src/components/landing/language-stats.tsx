'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SiGo,
  SiPython,
  SiLua,
  SiRust,
  SiZig,
  SiGnubash,
  SiTypescript,
  SiJavascript,
  SiNodedotjs
} from 'react-icons/si'
import { githubService } from '@/server/services/github'
import { Github, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '../ui/effects/animated-number'

type Language = {
  name: string
  count: number
  repos: string[]
  percentage: number
}

const LANGUAGE_META: Record<string, { icon: any, color: string }> = {
  "TypeScript": { icon: SiTypescript, color: "#3178c6" },
  "JavaScript": { icon: SiJavascript, color: "#f1e05a" },
  "Go": { icon: SiGo, color: "#00add8" },
  "Python": { icon: SiPython, color: "#3572A5" },
  "Lua": { icon: SiLua, color: "#000080" },
  "Rust": { icon: SiRust, color: "#dea584" },
  "Zig": { icon: SiZig, color: "#ec915c" },
  "Node.js": { icon: SiNodedotjs, color: "#339933" },
  "Shell": { icon: SiGnubash, color: "#89e051" },
}

export function LanguageStats() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredLang, setHoveredLang] = useState<string | null>(null)

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

  if (languages.length === 0) return null

  return (
    <div className="space-y-6 pt-4 pb-8 px-4">
      <div className="space-y-2">
        <p className="prose-sm text-muted-foreground/80 leading-relaxed max-w-xl">
          Beyond my primary stack, I'm constantly exploring new paradigms and languages.
          This breakdown reflects my activity across <span className="text-foreground/90 font-medium">GitHub</span>, from production tools to experimental playgrounds.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {languages.map((lang, index) => {
          const meta = LANGUAGE_META[lang.name] || { icon: SiTypescript, color: '#888' }
          const Icon = meta.icon

          return (
            <div
              key={lang.name}
              onMouseEnter={() => setHoveredLang(lang.name)}
              onMouseLeave={() => setHoveredLang(null)}
              className={cn(
                "group relative flex items-center  gap-2.5 px-3 py-1.5 rounded-md transition-all duration-300",
                "bg-secondary/30 hover:bg-secondary/50 border border-transparent",
                "cursor-default overflow-visible"
              )}
              style={{
                borderColor: hoveredLang === lang.name ? `${meta.color}40` : 'transparent',
              }}
            >
              <Icon
                className="w-3.5 h-3.5 transition-colors duration-300"
                style={{ color: hoveredLang === lang.name ? meta.color : undefined }}
              />
              <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">
                {lang.name}
              </span>
              <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                <AnimatedNumber 
                  value={lang.count} 
                  duration={800 + (index * 150)} 
                  initialProgress={0} 
                />
              </span>

              <AnimatePresence>
                {hoveredLang === lang.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-full left-0 mb-3 z-50 pointer-events-auto"
                  >
                    <div className="bg-popover/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl p-3 min-w-[220px] max-w-[280px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Top Projects
                        </span>
                        <div
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                      </div>

                      <div className="space-y-1">
                        {lang.repos.slice(0, 5).map((repo) => {
                          const name = repo.split('/').pop()
                          return (
                            <a
                              key={repo}
                              href={`https://github.com/${repo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between group/repo px-2 py-1.5 rounded-md hover:bg-foreground/5 transition-colors"
                            >
                              <span className="text-[11px] text-foreground/70 group-hover/repo:text-foreground truncate mr-2">
                                {name}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/repo:opacity-40 transition-opacity shrink-0" />
                            </a>
                          )
                        })}
                        {lang.repos.length > 5 && (
                          <div className="px-2 pt-1">
                            <span className="text-[10px] text-muted-foreground/40 italic">
                              + {lang.repos.length - 5} more projects
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="absolute top-[calc(100%-1px)] left-6 border-[6px] border-transparent border-t-popover/95" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/5">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30 font-mono">
          <Github className="w-3 h-3" />
          <span>Real-time GitHub Metrics</span>
        </div>
      </div>
    </div>
  )
}
