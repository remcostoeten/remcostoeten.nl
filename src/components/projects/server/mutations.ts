"use server"

import { db } from "@/lib/db"
import { projects, projectSettings } from "../../../server/db/project-schema"
import { eq, gt, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/auth-guard"

type MutationResult<T = void> = { success: true; data?: T } | { success: false; error: string }

async function guardAdmin(): Promise<MutationResult> {
  const admin = await isAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }
  return { success: true }
}

export async function createProject(data: {
  title: string
  desc: string
  featured?: boolean
  gitUrl?: string
  demoUrl?: string
  demoBox?: string
  showLive?: boolean
  native?: boolean
  labels?: string[]
  showUpd?: boolean
  showCommits?: boolean
  showFirst?: boolean
  showLatest?: boolean
  hidden?: boolean
  defaultOpen?: boolean
  showIndicator?: boolean
}): Promise<MutationResult<{ id: string }>> {
  const guard = await guardAdmin()
  if (!guard.success) return guard

  if (!data.title?.trim()) return { success: false, error: "Title is required" }
  if (!data.desc?.trim()) return { success: false, error: "Description is required" }

  const allProjects = await db.select({ idx: projects.idx }).from(projects)
  const maxIdx = allProjects.length > 0 ? Math.max(...allProjects.map((p) => p.idx)) : 0
  const newIdx = maxIdx + 1

  const [project] = await db
    .insert(projects)
    .values({
      ...data,
      idx: newIdx,
      labels: data.labels ?? [],
    })
    .returning({ id: projects.id })

  revalidatePath("/")
  revalidatePath("/admin/projects")

  return { success: true, data: { id: project.id } }
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string
    desc: string
    featured: boolean
    gitUrl: string | null
    demoUrl: string | null
    demoBox: string | null
    showLive: boolean
    native: boolean
    labels: string[]
    showUpd: boolean
    showCommits: boolean
    showFirst: boolean
    showLatest: boolean
    hidden: boolean
    defaultOpen: boolean
    showIndicator: boolean
  }>,
): Promise<MutationResult> {
  const guard = await guardAdmin()
  if (!guard.success) return guard

  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))

  revalidatePath("/")
  revalidatePath("/admin/projects")

  return { success: true }
}

export async function deleteProject(id: string): Promise<MutationResult> {
  const guard = await guardAdmin()
  if (!guard.success) return guard

  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning({ idx: projects.idx })

  if (deleted) {
    await db
      .update(projects)
      .set({ idx: sql`${projects.idx} - 1` })
      .where(gt(projects.idx, deleted.idx))
  }

  revalidatePath("/")
  revalidatePath("/admin/projects")

  return { success: true }
}

export async function reorderProject(id: string, newIdx: number): Promise<MutationResult> {
  const guard = await guardAdmin()
  if (!guard.success) return guard

  const [project] = await db.select().from(projects).where(eq(projects.id, id))
  if (!project) return { success: false, error: "Project not found" }

  const oldIdx = project.idx
  if (oldIdx === newIdx) return { success: true }

  if (newIdx > oldIdx) {
    await db
      .update(projects)
      .set({ idx: sql`${projects.idx} - 1` })
      .where(sql`${projects.idx} > ${oldIdx} AND ${projects.idx} <= ${newIdx}`)
  } else {
    await db
      .update(projects)
      .set({ idx: sql`${projects.idx} + 1` })
      .where(sql`${projects.idx} >= ${newIdx} AND ${projects.idx} < ${oldIdx}`)
  }

  await db.update(projects).set({ idx: newIdx, updatedAt: new Date() }).where(eq(projects.id, id))

  revalidatePath("/")
  revalidatePath("/admin/projects")

  return { success: true }
}

export async function moveProject(id: string, direction: "up" | "down"): Promise<MutationResult> {
  const guard = await guardAdmin()
  if (!guard.success) return guard

  const [project] = await db.select().from(projects).where(eq(projects.id, id))
  if (!project) return { success: false, error: "Project not found" }

  const targetIdx = direction === "up" ? project.idx - 1 : project.idx + 1
  if (targetIdx < 1) return { success: false, error: "Already at top" }

  const [swapProject] = await db.select().from(projects).where(eq(projects.idx, targetIdx))
  if (!swapProject) return { success: false, error: "Cannot move further" }

  await db.update(projects).set({ idx: -1 }).where(eq(projects.id, id))
  await db.update(projects).set({ idx: project.idx }).where(eq(projects.id, swapProject.id))
  await db.update(projects).set({ idx: targetIdx, updatedAt: new Date() }).where(eq(projects.id, id))

  revalidatePath("/")
  revalidatePath("/admin/projects")

  return { success: true }
}

export async function updateSettings(showN: number): Promise<MutationResult> {
  const guard = await guardAdmin()
  if (!guard.success) return guard

  if (showN < 1 || showN > 50) return { success: false, error: "showN must be between 1 and 50" }

  await db.update(projectSettings).set({ showN, updatedAt: new Date() }).where(eq(projectSettings.id, "singleton"))

  revalidatePath("/")
  revalidatePath("/admin/projects")

  return { success: true }
}
