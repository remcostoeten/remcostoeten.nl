"use client"

import { Folder, Star, GitBranch, Calendar, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchSpecificFeaturedProjects, type RepoData } from "@/services/github-service"

interface SimpleProject {
  name: string
  url: string
  gitInfo?: {
    stars?: number
    forks?: number
    lastCommit?: string
    language?: string
    contributors?: number
    description?: string
    totalCommits?: number
    startDate?: string
    lastCommitDate?: string
  }
}

// Helper function to generate topic labels based on project names
function getProjectTopics(projectName: string): string[] {
  const topics: string[] = []
  const name = projectName.toLowerCase()

  // React/Next.js projects
  if (name.includes('react') || name.includes('next') || name.includes('jsx')) {
    topics.push('React')
  }

  // Emoji/feedback projects
  if (name.includes('emoji') || name.includes('feedback')) {
    topics.push('UI/UX')
  }

  // File tree projects
  if (name.includes('file') && name.includes('tree')) {
    topics.push('File Management')
  }

  // Code block/syntax highlighting projects
  if (name.includes('code') && name.includes('block')) {
    topics.push('Syntax Highlighting')
  }

  // API/analytics projects
  if (name.includes('api') || name.includes('analytics')) {
    topics.push('API')
  }

  // TypeScript projects
  if (name.includes('ts') || name.includes('type')) {
    topics.push('TypeScript')
  }

  // Add some default topics if no specific ones match
  if (topics.length === 0) {
    topics.push('Web Development')
    if (name.includes('widget') || name.includes('component')) {
      topics.push('Components')
    }
  }

  return topics.slice(0, 2) // Limit to 2 topics max
}

export const LatestProjectSection = () => {
  const [featuredProjects, setFeaturedProjects] = useState<SimpleProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

          setFeaturedProjects(projectsData)
          setError(null)
          console.log(`✅ Successfully loaded ${projectsData.length} featured projects from API`)
        } else {
          throw new Error("No valid data received from GitHub API")
        }
      } catch (error) {
        console.error("❌ Failed to load featured projects from API:", error)
        setError("Failed to load project data from GitHub API")
        setFeaturedProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProjects()
  }, [])

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-4">
        <Folder className="w-4 h-4 text-accent" />
        <h2 className="text-lg font-medium text-foreground">Featured Projects</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-5 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-3 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        </div>
      ) : featuredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {featuredProjects.slice(0, 4).map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border border-border/50 rounded-lg p-4 hover:border-accent/50 hover:shadow-lg hover:-rotate-1 transition-all duration-300 hover:scale-105 block"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                  {project.name}
                </h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
              </div>

              {project.gitInfo?.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.gitInfo.description}
                </p>
              )}

              {/* Topic labels */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {getProjectTopics(project.name).map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{project.gitInfo?.stars || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  <span>{project.gitInfo?.language || "Unknown"}</span>
                </div>
                {project.gitInfo?.lastCommitDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {new Date(project.gitInfo.lastCommitDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-8 text-center mb-6">
          <div className="text-sm text-muted-foreground">No project data available</div>
        </div>
      )}

      <div className="pt-4">
        <a
          href="https://github.com/remcostoeten"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium group transition-all duration-200 text-sm border border-accent/20 hover:border-accent/40 px-4 py-2 rounded-lg hover:bg-accent/5"
        >
          <span>View all projects</span>
          <span className="transition-transform group-hover:translate-x-1 duration-200">↗</span>
        </a>
      </div>
    </div>
  )
}
