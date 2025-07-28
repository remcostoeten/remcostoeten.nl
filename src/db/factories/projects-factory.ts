import { db } from '../connection'
import { projects } from '../schema'
import type { TProject, TNewProject } from '../schema'
import { eq } from 'drizzle-orm'

type TCreateProject = Omit<TProject, 'id' | 'createdAt' | 'updatedAt'>
type TUpdateProject = Partial<TCreateProject> & { readonly id: string }

type TProjectsFactory = {
  readonly getAllProjects: (limit?: number) => Promise<TProject[]>
  readonly getProjectById: (id: string) => Promise<TProject | null>
  readonly createProject: (data: TCreateProject) => Promise<TProject | null>
  readonly updateProject: (data: TUpdateProject) => Promise<TProject | null>
  readonly deleteProject: (id: string) => Promise<boolean>
  readonly getProjectsByStatus: (status: TProject['status']) => Promise<TProject[]>
}

function createProjectsFactory(): TProjectsFactory {
  async function getAllProjects(limit = 50): Promise<TProject[]> {
    try {
      const result = await db.select().from(projects).limit(limit)
      return result
    } catch (error) {
      console.error('Failed to get projects:', error)
      return []
    }
  }

  async function getProjectById(id: string): Promise<TProject | null> {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get project by id:', error)
      return null
    }
  }

  async function createProject(data: TCreateProject): Promise<TProject | null> {
    try {
      const result = await db.insert(projects).values(data).returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to create project:', error)
      return null
    }
  }

  async function updateProject(data: TUpdateProject): Promise<TProject | null> {
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

  async function deleteProject(id: string): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id))
      return result.rowsAffected > 0
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    }
  }

  async function getProjectsByStatus(status: TProject['status']): Promise<TProject[]> {
    try {
      const result = await db.select().from(projects).where(eq(projects.status, status))
      return result
    } catch (error) {
      console.error('Failed to get projects by status:', error)
      return []
    }
  }

  return {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectsByStatus
  }
}

export const projectsFactory = createProjectsFactory()
