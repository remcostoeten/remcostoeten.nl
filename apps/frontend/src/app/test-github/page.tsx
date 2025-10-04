"use client"

import { useState, useEffect } from 'react'
import { fetchSpecificFeaturedProjects, type RepoData } from '@/services/github-service'

type RepoDataWithCategory = RepoData & { category: 'APIs' | 'DX tooling' | 'projects' }

export default function TestGitHubPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RepoDataWithCategory[]>([])
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const testFetch = async () => {
      setLogs(prev => [...prev, '🔄 Starting GitHub API test...'])
      
      try {
        setLogs(prev => [...prev, '📡 Calling fetchSpecificFeaturedProjects()...'])
        const result = await fetchSpecificFeaturedProjects()
        
        setLogs(prev => [...prev, `✅ Received ${result.length} projects`])
        setData(result)
        setError(null)
        
        result.forEach((repo, index) => {
          setLogs(prev => [...prev, `   ${index + 1}. ${repo.title} (${repo.category}) - ${repo.stars} stars`])
        })
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setLogs(prev => [...prev, `❌ Error: ${errorMsg}`])
        setError(errorMsg)
      } finally {
        setLoading(false)
        setLogs(prev => [...prev, '✅ Test completed'])
      }
    }

    testFetch()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">GitHub API Test</h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="bg-card border rounded-lg p-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Testing...</span>
              </div>
            ) : error ? (
              <div className="text-red-500">❌ Error: {error}</div>
            ) : (
              <div className="text-green-500">✅ Success: Loaded {data.length} projects</div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Console Logs</h2>
          <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        {data.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Fetched Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((project) => (
                <div key={project.title} className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span>⭐ {project.stars}</span>
                    <span>🔄 {project.forks}</span>
                    <span>💻 {project.language}</span>
                    <span className="bg-accent/10 px-2 py-1 rounded">{project.category}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last updated: {project.lastUpdated}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Environment Check</h2>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm">
              <div>GitHub Token: {process.env.NEXT_PUBLIC_GITHUB_TOKEN ? '✅ Present' : '❌ Missing'}</div>
              <div>Environment: {process.env.NODE_ENV}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}