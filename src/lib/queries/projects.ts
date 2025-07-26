import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query'
import type { TProject } from '~/db/schema'

type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

type TCreateProjectData = Omit<TProject, 'id' | 'createdAt' | 'updatedAt'>
type TUpdateProjectData = Partial<TCreateProjectData> & { id: string }

const fetchProjects = async (params?: { limit?: number; status?: string }): Promise<TProject[]> => {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.status) searchParams.set('status', params.status)
  
  const response = await fetch(`/api/projects?${searchParams}`)
  const result: TApiResponse<TProject[]> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch projects')
  }
  
  return result.data || []
}

const fetchProjectById = async (id: string): Promise<TProject> => {
  const response = await fetch(`/api/projects/${id}`)
  const result: TApiResponse<TProject> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch project')
  }
  
  if (!result.data) {
    throw new Error('Project not found')
  }
  
  return result.data
}

const createProject = async (data: TCreateProjectData): Promise<TProject> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result: TApiResponse<TProject> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create project')
  }
  
  if (!result.data) {
    throw new Error('No project data returned')
  }
  
  return result.data
}

const updateProject = async (data: TUpdateProjectData): Promise<TProject> => {
  const response = await fetch(`/api/projects/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result: TApiResponse<TProject> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update project')
  }
  
  if (!result.data) {
    throw new Error('No project data returned')
  }
  
  return result.data
}

const deleteProject = async (id: string): Promise<void> => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE'
  })
  
  const result: TApiResponse<void> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete project')
  }
}

// Query hooks following functional naming conventions
export const useGetProjects = (params?: { limit?: number; status?: string }) => {
  return createQuery(() => ({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params)
  }))
}

export const useGetProjectById = (id: string | undefined) => {
  return createQuery(() => ({
    queryKey: ['projects', id],
    queryFn: () => fetchProjectById(id!),
    enabled: !!id
  }))
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  }))
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: updateProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] })
    }
  }))
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  }))
}
