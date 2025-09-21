"use client"

import { motion } from "framer-motion"
import { Folder } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchSpecificFeaturedProjects, type RepoData } from "@/services/github-service"

const ANIMATION_CONFIGS = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  header: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  staggerContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.2,
      staggerChildren: 0.08,
      ease: "easeOut",
    },
  },
  item: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

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
    <motion.div className="py-6" {...ANIMATION_CONFIGS.container}>
      <motion.div className="flex items-center gap-3 mb-3" {...ANIMATION_CONFIGS.header}>
        <Folder className="w-4 h-4 text-accent" />
        <h2 className="text-lg font-medium text-foreground">Featured Projects</h2>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="space-y-2 mb-4"
          variants={ANIMATION_CONFIGS.staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-colors duration-200"
              variants={ANIMATION_CONFIGS.item}
            >
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-48"></div>
              </div>
              <div className="animate-pulse flex items-center gap-2">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="w-1 h-1 bg-muted rounded-full"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : error ? (
        <motion.div className="space-y-2 mb-4" {...ANIMATION_CONFIGS.header}>
          <div className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-colors duration-200">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>⚠</span>
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-accent hover:underline transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      ) : featuredProjects.length > 0 ? (
        <motion.div
          className="space-y-2 mb-4"
          variants={ANIMATION_CONFIGS.staggerContainer}
          initial="initial"
          animate="animate"
        >
          {featuredProjects.map((project) => (
            <motion.div
              key={project.name}
              className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-all duration-200"
              variants={ANIMATION_CONFIGS.item}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200 inline-flex items-center gap-2"
              >
                <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
                {project.name}
              </a>
              <div className="text-xs text-muted-foreground/70 flex items-center gap-2 group-hover:text-muted-foreground transition-colors duration-200">
                <span>{project.gitInfo?.stars || 0} stars</span>
                <span>•</span>
                <span>{project.gitInfo?.language || "Unknown"}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className="space-y-2 mb-4" {...ANIMATION_CONFIGS.header}>
          <div className="flex items-center justify-center py-4">
            <div className="text-xs text-muted-foreground">No project data available</div>
          </div>
        </motion.div>
      )}

      <motion.div {...ANIMATION_CONFIGS.header} transition={{ ...ANIMATION_CONFIGS.header.transition, delay: 0.2 }}>
        <a
          href="https://github.com/remcostoeten"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium group transition-colors duration-200"
        >
          <span>View all projects</span>
          <span className="transition-transform group-hover:translate-x-1 duration-200">↗</span>
        </a>
      </motion.div>
    </motion.div>
  )
}
