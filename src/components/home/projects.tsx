'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Star, GitBranch, Package } from 'lucide-react';

type Project = {
  id: string
  name: string
  description: string
  url: string
  github: string
  stars: number
  forks: number
  language: string
  languageColor: string
  tags: string[]
  featured: boolean
  status: 'active' | 'maintained' | 'archived'
}

const projects: Project[] = [
  {
    id: 'remcostoeten.nl',
    name: 'remcostoeten.nl',
    description: 'Personal portfolio website built with Next.js 16, featuring blog functionality, activity tracking, and modern UI.',
    url: 'https://remcostoeten.nl',
    github: 'https://github.com/remcostoeten/remcostoeten.nl',
    stars: 12,
    forks: 3,
    language: 'TypeScript',
    languageColor: 'bg-blue-500',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX', 'React Query'],
    featured: true,
    status: 'active'
  },
  {
    id: 'drizzleasy',
    name: 'Drizzleasy',
    description: 'Type-safe database toolkit built on Drizzle ORM. Simplifies database operations with intuitive patterns and helpers.',
    url: 'https://github.com/remcostoeten/drizzleasy',
    github: 'https://github.com/remcostoeten/drizzleasy',
    stars: 45,
    forks: 8,
    language: 'TypeScript',
    languageColor: 'bg-blue-500',
    tags: ['Database', 'ORM', 'TypeScript', 'Drizzle'],
    featured: true,
    status: 'active'
  },
  {
    id: 'fync',
    name: 'Fync',
    description: 'Unified API library for 9+ services (GitHub, GitLab, Spotify, NPM, Google Calendar). TypeScript-first with Bun workspaces.',
    url: 'https://github.com/remcostoeten/fync',
    github: 'https://github.com/remcostoeten/fync',
    stars: 23,
    forks: 4,
    language: 'TypeScript',
    languageColor: 'bg-blue-500',
    tags: ['API', 'TypeScript', 'Bun', 'Integrations'],
    featured: true,
    status: 'active'
  },
  {
    id: 'expense-calendar',
    name: 'Expense Calendar',
    description: 'Calendar-based expense tracking application with Better Auth, Neon PostgreSQL, and Drizzle ORM integration.',
    url: 'https://github.com/remcostoeten/expense-calendar',
    github: 'https://github.com/remcostoeten/expense-calendar',
    stars: 15,
    forks: 2,
    language: 'TypeScript',
    languageColor: 'bg-blue-500',
    tags: ['Next.js', 'Database', 'Authentication', 'Calendar'],
    featured: false,
    status: 'maintained'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  }
};

export function ProjectsShowcase() {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProjects = projects.filter(project =>
    filter === 'all' || project.featured
  );

  if (!mounted) return null;

  return (
    <section className="space-y-8 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Featured Projects
          </h2>
          <p className="text-muted-foreground">
            Open-source projects and tools I've built and maintain
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'featured'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
          >
            Featured
          </button>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            className="group relative"
            onHoverStart={() => setHoveredProject(project.id)}
            onHoverEnd={() => setHoveredProject(null)}
          >
            <div className="relative h-full p-6 bg-card border border-border/50 rounded-xl hover:border-border/80 transition-all duration-300 hover:shadow-lg overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.status === 'active'
                  ? 'bg-muted/50 text-muted-foreground'
                  : project.status === 'maintained'
                    ? 'bg-muted/30 text-muted-foreground'
                    : 'bg-muted/20 text-muted-foreground'
                  }`}>
                  {project.status}
                </span>
              </div>

              {project.featured && (
                <div className="absolute top-4 left-4">
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                    Featured
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${project.languageColor}`} />
                    <span className="text-sm text-muted-foreground">{project.language}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{project.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-4 h-4" />
                    <span>{project.forks}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border/50 rounded-md hover:bg-accent/10 hover:border-border transition-all group/github"
                  >
                    <Github className="w-4 h-4 group-hover/github:scale-110 transition-transform" />
                    Code
                  </a>
                  {project.url !== project.github && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-all group/live"
                    >
                      <ExternalLink className="w-4 h-4 group-hover/live:scale-110 transition-transform" />
                      Live
                    </a>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center pt-4">
        <a
          href="https://github.com/remcostoeten"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border/50 rounded-lg hover:bg-accent/10 hover:border-border transition-all group"
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">View all projects on GitHub</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </section>
  );
}