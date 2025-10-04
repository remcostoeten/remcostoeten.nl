"use client"

import { Folder, Star, GitBranch, Calendar, ExternalLink, Filter, X } from "lucide-react"
import { useEffect, useState, useReducer } from "react"
import { fetchSpecificFeaturedProjects, type RepoData } from "@/services/github-service"
import { 
  projectFilterReducer, 
  initialProjectFilterState, 
  getProjectTopics,
  type SimpleProject 
} from "@/reducers/project-filter-reducer"

export const LatestProjectSection = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterState, dispatch] = useReducer(projectFilterReducer, initialProjectFilterState)
  
  const availableCategories = [
    'All',
    'Next.js',
    'TypeScript', 
    'Authentication',
    'Database',
    'CLI Tools',
    'Productivity',
    'UI Components',
    'API & Analytics',
    'Developer Tools',
    'DevOps'
  ]

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        console.log("🔄 Fetching featured projects from GitHub API...")
        const repoDataArray: RepoData[] = await fetchSpecificFeaturedProjects()

        if (repoDataArray && repoDataArray.length > 0) {
          // Transform the repo data into SimpleProject format
          const projectsData: SimpleProject[] = repoDataArray.map((repoData) => ({
            name: repoData.title,
            url: repoData.deploymentUrl || repoData.url,
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
            <Folder className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Featured Work</h2>
        <p className="text-sm text-muted-foreground mt-1">Recent projects and experiments</p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter by technology</span>
          {filterState.currentCategory !== 'All' && (
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded-full hover:bg-accent/30 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableCategories.map((category) => {
            const isActive = filterState.currentCategory === category
            const projectCount = category === 'All' 
              ? filterState.allProjects.length
              : filterState.allProjects.filter(project => 
                  getProjectTopics(project.name).includes(category)
                ).length
            
            if (category !== 'All' && projectCount === 0) return null
            
            return (
              <button
                key={category}
                onClick={() => dispatch({ type: 'SET_CATEGORY', payload: category })}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {category}
                <span className="text-xs opacity-75">({projectCount})</span>
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-muted/30 rounded-xl p-6 border border-border/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-6 bg-muted rounded w-36"></div>
                  <div className="h-8 w-8 bg-muted rounded-lg"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 bg-muted rounded-full w-16"></div>
                  <div className="h-5 bg-muted rounded-full w-20"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 text-destructive">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-sm">!</span>
            </div>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      ) : filterState.filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filterState.filteredProjects.slice(0, 12).map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-card border border-border/30 rounded-xl p-6 hover:border-accent/30 transition-all duration-300 block overflow-hidden"
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
                  {getProjectTopics(project.name).map((topic) => (
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
            </a>
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
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="mt-3 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              View all projects
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <a
          href="https://github.com/remcostoeten"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          <span className="relative">
            View all projects
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </span>
          <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        
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
