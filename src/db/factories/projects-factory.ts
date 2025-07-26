import { db } from '../connection'
import { projects } from '../schema'
import type { TProject } from '../schema'
import { eq } from 'drizzle-orm'

type TCreateProject = Omit<TProject, 'id' | 'createdAt' | 'updatedAt'>
type TUpdateProject = Partial<TCreateProject> & { readonly id: string }

type TProjectsFactory = {
  readonly testConnection: () => Promise<boolean>
  readonly getAllProjects: (limit?: number) => Promise<TProject[]>
  readonly getProjectById: (id: string) => Promise<TProject | null>
  readonly createProject: (data: TCreateProject) => Promise<TProject | null>
  readonly updateProject: (data: TUpdateProject) => Promise<TProject | null>
  readonly deleteProject: (id: string) => Promise<boolean>
  readonly getProjectsByStatus: (status: TProject['status']) => Promise<TProject[]>
}

const createProjectsFactory = (): TProjectsFactory => {
  const testConnection = async (): Promise<boolean> => {
    try {
      await db.select().from(projects).limit(1)
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }

  const getAllProjects = async (limit = 50): Promise<TProject[]> => {
    try {
      const result = await db.select().from(projects).limit(limit)
      return result
    } catch (error) {
      console.error('Failed to get projects:', error)
      return []
    }
  }

  const getProjectById = async (id: string): Promise<TProject | null> => {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get project by id:', error)
      return null
    }
  }

  const createProject = async (data: TCreateProject): Promise<TProject | null> => {
    try {
      const result = await db.insert(projects).values(data).returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to create project:', error)
      return null
    }
  }

  const updateProject = async (data: TUpdateProject): Promise<TProject | null> => {
    try {
      const { id, ...updateData } = data
      const result = await db
        .update(projects)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to update project:', error)
      return null
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id))
      return result.rowsAffected > 0
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  }

  const getProjectsByStatus = async (status: TProject['status']): Promise<TProject[]> => {
    try {
      const result = await db.select().from(projects).where(eq(projects.status, status))
      return result
    } catch (error) {
      console.error('Failed to get projects by status:', error)
      return []
    }
  }

  return {
    testConnection,
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectsByStatus
  }
}

export const projectsFactory = createProjectsFactory()
