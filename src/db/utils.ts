import { eq, desc, asc, and, or, sql } from "drizzle-orm";
import { db } from "./connection";
import { 
  projects, 
  skills, 
  experience, 
  contactSubmissions, 
  siteSettings,
  type TNewProject,
  type TNewSkill,
  type TNewExperience,
  type TNewContactSubmission,
  type TNewSiteSetting
} from "./schema";

// Project utilities
export async function getAllProjects() {
  return await db
    .select()
    .from(projects)
    .where(eq(projects.isPublished, true))
    .orderBy(desc(projects.featured), asc(projects.sortOrder));
}

export async function getFeaturedProjects() {
  return await db
    .select()
    .from(projects)
    .where(and(eq(projects.featured, true), eq(projects.isPublished, true)))
    .orderBy(asc(projects.sortOrder));
}

export async function getProjectBySlug(slug: string) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  
  return result[0] || null;
}

export async function createProject(data: TNewProject) {
  const result = await db
    .insert(projects)
    .values(data)
    .returning();
  
  return result[0];
}

// Skills utilities
export async function getAllSkills() {
  return await db
    .select()
    .from(skills)
    .where(eq(skills.isActive, true))
    .orderBy(desc(skills.proficiency), asc(skills.sortOrder));
}

export async function getSkillsByCategory(category: string) {
  return await db
    .select()
    .from(skills)
    .where(and(eq(skills.category, category), eq(skills.isActive, true)))
    .orderBy(desc(skills.proficiency), asc(skills.sortOrder));
}

export async function createSkill(data: TNewSkill) {
  const result = await db
    .insert(skills)
    .values(data)
    .returning();
  
  return result[0];
}

// Experience utilities
export async function getAllExperience() {
  return await db
    .select()
    .from(experience)
    .orderBy(desc(experience.startDate), asc(experience.sortOrder));
}

export async function createExperience(data: TNewExperience) {
  const result = await db
    .insert(experience)
    .values(data)
    .returning();
  
  return result[0];
}

// Contact utilities
export async function createContactSubmission(data: TNewContactSubmission) {
  const result = await db
    .insert(contactSubmissions)
    .values(data)
    .returning();
  
  return result[0];
}

export async function getUnreadContactSubmissions() {
  return await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.isRead, false))
    .orderBy(desc(contactSubmissions.createdAt));
}

export async function markContactAsRead(id: string) {
  const result = await db
    .update(contactSubmissions)
    .set({ 
      isRead: true,
      updatedAt: Date.now()
    })
    .where(eq(contactSubmissions.id, id))
    .returning();
  
  return result[0];
}

// Site settings utilities
export async function getSiteSettings() {
  return await db
    .select()
    .from(siteSettings)
    .orderBy(asc(siteSettings.key));
}

export async function getPublicSiteSettings() {
  return await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.isPublic, true))
    .orderBy(asc(siteSettings.key));
}

export async function getSiteSetting(key: string) {
  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  
  return result[0] || null;
}

export async function setSiteSetting(data: TNewSiteSetting) {
  const existing = await getSiteSetting(data.key);
  
  if (existing) {
    const result = await db
      .update(siteSettings)
      .set({ 
        value: data.value,
        type: data.type,
        description: data.description,
        isPublic: data.isPublic,
        updatedAt: Date.now()
      })
      .where(eq(siteSettings.key, data.key))
      .returning();
    
    return result[0];
  } else {
    const result = await db
      .insert(siteSettings)
      .values(data)
      .returning();
    
    return result[0];
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    await db.execute(sql`SELECT 1`);
    return { healthy: true, timestamp: Date.now() };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now() 
    };
  }
}
