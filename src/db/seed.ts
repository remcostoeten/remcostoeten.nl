import { db } from "./connection";
import { 
  projects, 
  skills, 
  experience, 
  siteSettings
} from "./schema";
import { SampleDataFactory } from '../data/sample-data-factory';

// Generate sample data using factory functions

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Generate sample data using factory
    const sampleProjects = SampleDataFactory.projects();
    const sampleSkills = SampleDataFactory.skills();
    const sampleExperience = SampleDataFactory.experience();
    const sampleSiteSettings = SampleDataFactory.siteSettings();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(projects);
    await db.delete(skills);
    await db.delete(experience);
    await db.delete(siteSettings);

    // Seed projects (only if sample data exists)
    if (sampleProjects.length > 0) {
      console.log("📁 Seeding projects...");
      await db.insert(projects).values(sampleProjects);
    } else {
      console.log("📁 No sample projects to seed (production mode)");
    }

    // Seed skills (only if sample data exists)
    if (sampleSkills.length > 0) {
      console.log("🛠️  Seeding skills...");
      await db.insert(skills).values(sampleSkills);
    } else {
      console.log("🛠️  No sample skills to seed (production mode)");
    }

    // Seed experience (only if sample data exists)
    if (sampleExperience.length > 0) {
      console.log("💼 Seeding experience...");
      await db.insert(experience).values(sampleExperience);
    } else {
      console.log("💼 No sample experience to seed (production mode)");
    }

    // Always seed site settings (uses environment variables)
    console.log("⚙️  Seeding site settings...");
    await db.insert(siteSettings).values(sampleSiteSettings);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
