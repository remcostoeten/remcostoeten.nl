import { ProjectData, SimpleProject } from "../types";

export const FEATURED_PROJECTS: ProjectData[] = [
  {
    title: "Roll Your Own Authentication",
    description: "A comprehensive Next.js 15 authentication system showcasing how to implement JWT-based auth without external services like Lucia, NextAuth, or Clerk. Features secure PostgreSQL storage, admin roles, onboarding flows, and more.",
    url: "https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication",
    demoUrl: "https://ryoa.vercel.app/",
    stars: 0,
    branches: 34,
    technologies: ["Next.js 15", "TypeScript", "PostgreSQL", "JWT", "Tailwind CSS"],
    lastUpdated: "recently",
    highlights: [
      "JWT authentication without external services",
      "Secure PostgreSQL user storage",
      "Admin role management system",
      "Configurable onboarding flows",
      "Modern Next.js 15 features"
    ]
  },
  {
    title: "Turso DB Creator CLI",
    description: "A powerful CLI tool for Turso (turso.tech) that automates SQLite database creation and credential management. Automatically copies URLs and auth tokens to clipboard with .env syntax, includes --overwrite flag for seamless credential updates.",
    url: "https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials",
    stars: 1,
    branches: 5,
    technologies: ["CLI", "Node.js", "Turso", "SQLite", "Shell Scripts"],
    lastUpdated: "recently",
    highlights: [
      "One-command database creation",
      "Automatic credential management",
      "Clipboard integration with .env format",
      "Smart credential overwriting",
      "Sub-10 second deployment workflow"
    ]
  }
];

export const SIMPLE_PROJECTS: SimpleProject[] = [
  { name: "WalkSmart", url: "#" },
  { name: "ZenPersonal", url: "#" }
];