import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query'
import type { TProject } from '~/db/schema'

type TCreateProjectData = {
  name: string
  description: string
  url?: string
  githubUrl?: string
  imageUrl?: string
  technologies: string[]
  status: 'active' | 'completed' | 'archived'
}

type TProjectsResponse = {
  success: boolean
  data?: TProject[]
  error?: string
}

async function fetchProjects(): Promise<TProject[]> {
  const response = await fetch('/api/projects')
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch projects')
  }

  return result.data || []
}

async function createProject(data: TCreateProjectData): Promise<TProject> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create project')
  }

  return result.data
}

export function useGetProjects() {
  return createQuery(() => ({
    queryKey: ['projects'],
    queryFn: fetchProjects
  }))
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  }))
}
