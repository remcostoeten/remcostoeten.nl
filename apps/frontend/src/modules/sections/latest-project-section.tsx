"use client"

import { Folder, Star, GitBranch, Calendar, ExternalLink, Filter, X, Sparkles } from "lucide-react"
import { Link } from "@/shared/components/link"
import { useEffect, useState, useReducer, useRef } from "react"
import { fetchSpecificFeaturedProjects, type RepoData } from "@/services/github-service"

type RepoDataWithCategory = RepoData & { category: 'APIs' | 'DX tooling' | 'projects' }
import {
  projectFilterReducer,
  initialProjectFilterState,
  getProjectCategories,
  type SimpleProject
} from "@/reducers/project-filter-reducer"
import { S } from "./serif"


export function LatestProjectSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterState, dispatch] = useReducer(projectFilterReducer, initialProjectFilterState)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousCategoryRef = useRef('All')

  const CATEGORIES = [
    'APIs',
    'DX tooling',
    'projects'
  ]

  function handleCategoryChange(category: string) {
    if (category === filterState.currentCategory) return

    setIsTransitioning(true)
    previousCategoryRef.current = filterState.currentCategory

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        dispatch({ type: 'SET_CATEGORY', payload: category })
      }).finished.then(() => {
        setIsTransitioning(false)
      })
    } else {
      dispatch({ type: 'SET_CATEGORY', payload: category })
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  function handleReset() {
    if (filterState.currentCategory === 'All') return

    setIsTransitioning(true)
    previousCategoryRef.current = filterState.currentCategory

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        dispatch({ type: 'RESET' })
      }).finished.then(() => {
        setIsTransitioning(false)
      })
    } else {
      dispatch({ type: 'RESET' })
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        console.log("🔄 Fetching featured projects from GitHub API...")
        const repoDataArray: RepoDataWithCategory[] = await fetchSpecificFeaturedProjects()

        if (repoDataArray && repoDataArray.length > 0) {
          // Transform the repo data into SimpleProject format
          const projectsData: SimpleProject[] = repoDataArray.map((repoData) => ({
            name: repoData.title,
            url: repoData.deploymentUrl || repoData.url,
            category: repoData.category, // Use the category from the fetched data
            gitInfo: {
              stars: repoData.stars,
              forks: repoData.forks,
              lastCommit: repoData.latestCommit
                ? `${repoData.latestCommit.message} (${repoData.latestCommit.age})`
                : repoData.lastUpdated,
              language: repoData.language,
              contributors: repoData.contributors || 1,
              description: repoData.description || "No description available",
              totalCommits: repoData.totalCommits,
              startDate: repoData.startDate,
              lastCommitDate: repoData.latestCommit?.date,
            },
          }))

          dispatch({ type: 'SET_PROJECTS', payload: projectsData })
          setError(null)
          console.log(`✅ Successfully loaded ${projectsData.length} featured projects from API`)
        } else {
          throw new Error("No valid data received from GitHub API")
        }
      } catch (error) {
        console.error("❌ Failed to load featured projects from API:", error)
        setError("Failed to load project data from GitHub API")
        dispatch({ type: 'SET_PROJECTS', payload: [] })
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProjects()
  }, [])

  return (
    <section className="py-12">


      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
          </div>
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
          </div>
          <p className="text-sm text-muted-foreground mt-1">This <S>simple</S> personal site actally has resulted in <S>A LOT</S> of custom packages, api's and allround experiments. If you are curious what I exactly build? <Link href='/blog/i-might-have-overengineerd' variant='underline'>Read it here</Link>.</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => {
            const isActive = filterState.currentCategory === category
            const projectCount = category === 'All'
              ? filterState.allProjects.length
              : filterState.allProjects.filter(project =>
                getProjectCategories(project).includes(category)
              ).length

            if (category !== 'All' && projectCount === 0) return null

            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                disabled={isTransitioning}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  } ${isTransitioning ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {category}
                <span className="text-xs opacity-75">({projectCount})</span>
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 text-destructive">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-sm">!</span>
            </div>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      ) : filterState.filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {filterState.filteredProjects.slice(0, 4).map((project, index) => (
            <Link
              key={project.name}
              href={project.url}
              external
              style={{
                viewTransitionName: `project-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                animationDelay: `${index * 50}ms`
              } as React.CSSProperties}
              className="group relative bg-card border border-border/30 rounded-xl p-6 hover:border-accent/30 transition-all duration-300 block overflow-hidden animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors duration-200 pr-2">
                    {project.name}
                  </h3>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-accent/20 flex items-center justify-center transition-all duration-200">
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>

                {project.gitInfo?.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {project.gitInfo.description}
                  </p>
                )}

                {/* Topic labels */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getProjectCategories(project).map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-600/70" />
                    <span className="font-medium">{project.gitInfo?.stars || 0}</span>
                  </div>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>{project.gitInfo?.language || "Unknown"}</span>
                  </div>
                  {project.gitInfo?.lastCommitDate && (
                    <>
                      <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                      <div className="hidden sm:flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        <span>{new Date(project.gitInfo.lastCommitDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-8 text-center mb-6">
          <div className="text-sm text-muted-foreground">
            {filterState.currentCategory === 'All'
              ? 'No projects available'
              : `No projects found for "${filterState.currentCategory}"`
            }
          </div>
          {filterState.currentCategory !== 'All' && (
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }}
              variant="accent"
              className="mt-3"
            >
              View all projects
            </Link>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="https://github.com/remcostoeten"
          variant="underline"
          showExternalIcon
        >
          View all projects
        </Link>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="w-3.5 h-3.5" />
          <span>
            {filterState.currentCategory === 'All'
              ? `${filterState.allProjects.length} total repos`
              : `${filterState.filteredProjects.length} of ${filterState.allProjects.length} repos`
            }
          </span>
        </div>
      </div>
    </section>
  )
}
