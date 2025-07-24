import { db } from "./connection";
import { 
  projects, 
  skills, 
  experience, 
  siteSettings,
  type TNewProject,
  type TNewSkill,
  type TNewExperience,
  type TNewSiteSetting
} from "./schema";

// Sample projects data
const sampleProjects: TNewProject[] = [
  {
    title: "Roll Your Own Authentication",
    description: "A comprehensive Next.js 15 authentication system showcasing how to implement JWT-based auth without external services like Lucia, NextAuth, or Clerk. Features secure PostgreSQL storage, admin roles, onboarding flows, and more.",
    longDescription: "Built a comprehensive Next.js 15 authentication system that demonstrates how to roll your own authentication without relying on external services. Features include secure PostgreSQL user storage, JWT token management, admin role system, configurable onboarding flows, password reset functionality, and email verification.",
    url: "https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication",
    demoUrl: "https://ryoa.vercel.app/",
    githubUrl: "https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication",
    technologies: ["Next.js 15", "TypeScript", "PostgreSQL", "JWT", "Tailwind CSS", "Drizzle ORM"],
    category: "Web Application",
    featured: true,
    status: "completed",
    startDate: Date.parse("2024-01-01"),
    endDate: Date.parse("2024-06-01"),
    highlights: [
      "JWT authentication without external services",
      "Secure PostgreSQL user storage", 
      "Admin role management system",
      "Configurable onboarding flows",
      "Modern Next.js 15 features"
    ],
    metrics: {
      stars: 12,
      forks: 3
    },
    isPublished: true,
    sortOrder: 1,
    slug: "roll-your-own-authentication"
  },
  {
    title: "Turso DB Creator CLI",
    description: "A powerful CLI tool for Turso (turso.tech) that automates SQLite database creation and credential management. Automatically copies URLs and auth tokens to clipboard with .env syntax, includes --overwrite flag for seamless credential updates.",
    longDescription: "Developed a command-line interface tool that streamlines the Turso database creation workflow. The tool automatically creates databases, retrieves credentials, formats them for .env files, and copies them to the clipboard. Includes smart overwriting capabilities and sub-10 second deployment workflows.",
    url: "https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials",
    githubUrl: "https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials",
    technologies: ["CLI", "Node.js", "Turso", "SQLite", "Shell Scripts"],
    category: "Developer Tool",
    featured: true,
    status: "completed",
    startDate: Date.parse("2024-07-01"),
    highlights: [
      "One-command database creation",
      "Automatic credential management",
      "Clipboard integration with .env format",
      "Smart credential overwriting",
      "Sub-10 second deployment workflow"
    ],
    metrics: {
      stars: 8,
      forks: 2
    },
    isPublished: true,
    sortOrder: 2,
    slug: "turso-db-creator-cli"
  },
  {
    title: "remcostoeten.nl",
    description: "Personal portfolio website built with Next.js, featuring a custom CMS system and modern design principles.",
    longDescription: "My personal portfolio website showcasing projects, skills, and experience. Features a custom-built CMS system for content management, modern responsive design, and integration with various APIs for dynamic content.",
    url: "https://remcostoeten.nl",
    demoUrl: "https://remcostoeten.nl",
    githubUrl: "https://github.com/remcostoeten/remcostoeten.nl",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Drizzle ORM"],
    category: "Portfolio",
    featured: false,
    status: "completed",
    startDate: Date.parse("2024-01-01"),
    highlights: [
      "Custom CMS system",
      "Modern responsive design",
      "API integrations",
      "Performance optimized"
    ],
    isPublished: true,
    sortOrder: 3,
    slug: "remcostoeten-portfolio"
  }
];

// Sample skills data
const sampleSkills: TNewSkill[] = [
  {
    name: "TypeScript",
    category: "Programming Languages",
    proficiency: 5,
    yearsOfExperience: 4,
    isActive: true,
    sortOrder: 1
  },
  {
    name: "React",
    category: "Frontend Frameworks",
    proficiency: 5,
    yearsOfExperience: 5,
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Next.js",
    category: "Frontend Frameworks",
    proficiency: 5,
    yearsOfExperience: 3,
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Node.js",
    category: "Backend",
    proficiency: 4,
    yearsOfExperience: 4,
    isActive: true,
    sortOrder: 1
  },
  {
    name: "PostgreSQL",
    category: "Database",
    proficiency: 4,
    yearsOfExperience: 3,
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    proficiency: 5,
    yearsOfExperience: 3,
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Drizzle ORM",
    category: "Database",
    proficiency: 4,
    yearsOfExperience: 1,
    isActive: true,
    sortOrder: 2
  }
];

// Sample experience data
const sampleExperience: TNewExperience[] = [
  {
    title: "Frontend Developer",
    company: "Freelance",
    location: "Remote, Netherlands",
    startDate: Date.parse("2022-01-01"),
    isCurrent: true,
    description: "Working on various projects including e-commerce platforms, SaaS applications, and custom web solutions. Specializing in React, Next.js, and TypeScript development.",
    achievements: [
      "Built 15+ production applications",
      "Improved client website performance by 40% on average",
      "Developed reusable component libraries",
      "Mentored junior developers"
    ],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    sortOrder: 1
  },
  {
    title: "Full Stack Developer",
    company: "TechCorp",
    location: "Amsterdam, Netherlands",
    startDate: Date.parse("2020-06-01"),
    endDate: Date.parse("2021-12-31"),
    isCurrent: false,
    description: "Developed and maintained web applications using modern JavaScript frameworks. Collaborated with design and product teams to deliver user-friendly solutions.",
    achievements: [
      "Led frontend architecture decisions",
      "Reduced application bundle size by 30%",
      "Implemented automated testing strategies",
      "Contributed to open source projects"
    ],
    technologies: ["React", "Node.js", "MongoDB", "Express.js"],
    sortOrder: 2
  }
];

// Sample site settings
const sampleSiteSettings: TNewSiteSetting[] = [
  {
    key: "site_title",
    value: "Remco Stoeten - Frontend Developer",
    type: "string",
    description: "Main site title",
    isPublic: true
  },
  {
    key: "site_description", 
    value: "Frontend Developer focused on creating efficient and maintainable web applications. Working remotely from Lemmer, Netherlands.",
    type: "string",
    description: "Site meta description",
    isPublic: true
  },
  {
    key: "contact_email",
    value: "remco@remcostoeten.nl",
    type: "string", 
    description: "Primary contact email",
    isPublic: true
  },
  {
    key: "github_url",
    value: "https://github.com/remcostoeten",
    type: "string",
    description: "GitHub profile URL",
    isPublic: true
  },
  {
    key: "website_url",
    value: "https://remcostoeten.nl",
    type: "string",
    description: "Main website URL",
    isPublic: true
  }
];

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(projects);
    await db.delete(skills);
    await db.delete(experience);
    await db.delete(siteSettings);

    // Seed projects
    console.log("📁 Seeding projects...");
    await db.insert(projects).values(sampleProjects);

    // Seed skills
    console.log("🛠️  Seeding skills...");
    await db.insert(skills).values(sampleSkills);

    // Seed experience
    console.log("💼 Seeding experience...");
    await db.insert(experience).values(sampleExperience);

    // Seed site settings
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
