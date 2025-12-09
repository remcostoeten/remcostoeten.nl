'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Database,
  Cloud,
  Palette,
  Cpu,
  Globe,
  Package,
  GitBranch,
  Server,
  Shield,
  Zap,
  Sparkles
} from 'lucide-react';

interface TechCategory {
  name: string;
  icon: React.ReactNode;
  technologies: TechItem[];
}

interface TechItem {
  name: string;
  description: string;
  category: string;
  proficiency: 'expert' | 'advanced' | 'intermediate';
  years: number;
  color: string;
  bgGradient?: string;
}

const techData: TechItem[] = [
  // Frontend
  {
    name: 'React',
    description: 'Building interactive user interfaces with hooks, context, and modern patterns',
    category: 'Frontend',
    proficiency: 'expert',
    years: 6,
    color: 'text-primary',
    bgGradient: 'from-primary/5 to-primary/10'
  },
  {
    name: 'Next.js',
    description: 'Full-stack React framework with SSR, SSG, and API routes',
    category: 'Frontend',
    proficiency: 'expert',
    years: 4,
    color: 'text-gray-800 dark:text-white',
    bgGradient: 'from-gray-100/20 to-gray-900/20'
  },
  {
    name: 'TypeScript',
    description: 'Type-safe JavaScript development with advanced type patterns',
    category: 'Frontend',
    proficiency: 'expert',
    years: 5,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    category: 'Frontend',
    proficiency: 'expert',
    years: 4,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'Framer Motion',
    description: 'Production-ready motion library for React with physics animations',
    category: 'Frontend',
    proficiency: 'advanced',
    years: 3,
    color: 'text-muted-foreground',
    bgGradient: 'from-muted/5 to-muted/10'
  },
  // Backend
  {
    name: 'Node.js',
    description: 'Server-side JavaScript runtime for building scalable applications',
    category: 'Backend',
    proficiency: 'advanced',
    years: 5,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'API Design',
    description: 'RESTful and GraphQL API development with documentation',
    category: 'Backend',
    proficiency: 'advanced',
    years: 6,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'Authentication',
    description: 'OAuth, JWT, session management, and security best practices',
    category: 'Backend',
    proficiency: 'advanced',
    years: 4,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  // Database
  {
    name: 'PostgreSQL',
    description: 'Advanced SQL queries, indexing, and performance optimization',
    category: 'Database',
    proficiency: 'advanced',
    years: 4,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'Drizzle ORM',
    description: 'Type-safe SQL toolkit with excellent TypeScript support',
    category: 'Database',
    proficiency: 'expert',
    years: 2,
    color: 'text-primary',
    bgGradient: 'from-primary/5 to-primary/10'
  },
  {
    name: 'SQLite/Turso',
    description: 'Lightweight embedded databases for edge and serverless applications',
    category: 'Database',
    proficiency: 'advanced',
    years: 2,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  // DevOps & Tools
  {
    name: 'Git',
    description: 'Version control, branching strategies, and collaborative workflows',
    category: 'DevOps',
    proficiency: 'expert',
    years: 8,
    color: 'text-primary',
    bgGradient: 'from-primary/5 to-primary/10'
  },
  {
    name: 'Vercel/Deployment',
    description: 'Serverless deployment, CI/CD pipelines, and performance monitoring',
    category: 'DevOps',
    proficiency: 'advanced',
    years: 4,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'Performance',
    description: 'Web vitals optimization, code splitting, and Core Web Vitals',
    category: 'DevOps',
    proficiency: 'advanced',
    years: 5,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  // Design
  {
    name: 'UI/UX Design',
    description: 'User-centered design principles, accessibility, and responsive layouts',
    category: 'Design',
    proficiency: 'advanced',
    years: 8,
    color: 'text-foreground',
    bgGradient: 'from-muted/10 to-muted/20'
  },
  {
    name: 'Figma',
    description: 'Design systems, component libraries, and collaborative design',
    category: 'Design',
    proficiency: 'intermediate',
    years: 3,
    color: 'text-muted-foreground',
    bgGradient: 'from-muted/5 to-muted/10'
  }
];

const categories: TechCategory[] = [
  {
    name: 'Frontend',
    icon: <Code2 className="w-5 h-5" />,
    technologies: techData.filter(tech => tech.category === 'Frontend')
  },
  {
    name: 'Backend',
    icon: <Server className="w-5 h-5" />,
    technologies: techData.filter(tech => tech.category === 'Backend')
  },
  {
    name: 'Database',
    icon: <Database className="w-5 h-5" />,
    technologies: techData.filter(tech => tech.category === 'Database')
  },
  {
    name: 'DevOps',
    icon: <Cloud className="w-5 h-5" />,
    technologies: techData.filter(tech => tech.category === 'DevOps')
  },
  {
    name: 'Design',
    icon: <Palette className="w-5 h-5" />,
    technologies: techData.filter(tech => tech.category === 'Design')
  }
];

const getProficiencyColor = (proficiency: TechItem['proficiency']) => {
  switch (proficiency) {
    case 'expert':
      return 'bg-primary';
    case 'advanced':
      return 'bg-muted-foreground';
    case 'intermediate':
      return 'bg-muted-foreground/60';
    default:
      return 'bg-muted';
  }
};

const getProficiencyWidth = (proficiency: TechItem['proficiency']) => {
  switch (proficiency) {
    case 'expert':
      return 'w-full';
    case 'advanced':
      return 'w-4/5';
    case 'intermediate':
      return 'w-3/5';
    default:
      return 'w-2/5';
  }
};

export function TechStack() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTechnologies = selectedCategory === 'all'
    ? techData
    : techData.filter(tech => tech.category === selectedCategory);

  if (!mounted) return null;

  return (
    <section className="space-y-8 animate-enter">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Tech Stack & Skills
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Technologies and tools I work with daily, organized by expertise area
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All Technologies
        </button>
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              selectedCategory === category.name
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechnologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
              type: "spring",
              stiffness: 100
            }}
            className="group relative"
            onMouseEnter={() => setHoveredTech(tech.name)}
            onMouseLeave={() => setHoveredTech(null)}
          >
            <div className={`relative p-4 bg-card border border-border/50 rounded-xl hover:border-border transition-all duration-300 overflow-hidden ${
              tech.bgGradient ? `bg-gradient-to-br ${tech.bgGradient}` : ''
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h3 className={`font-semibold text-foreground ${tech.color}`}>
                    {tech.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tech.years} years</span>
                    <span>•</span>
                    <span className="capitalize">{tech.proficiency}</span>
                  </div>
                </div>

                {/* Proficiency Indicator */}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted/50" />
                  <div className="w-2 h-2 rounded-full bg-muted/50" />
                  <div className="w-2 h-2 rounded-full bg-muted/50" />
                  <div
                    className={`w-2 h-2 rounded-full ${getProficiencyColor(tech.proficiency)} ${
                      tech.proficiency === 'expert' ? '' : tech.proficiency === 'advanced' ? '-ml-2' : '-ml-4'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {tech.description}
              </p>

              {/* Proficiency Bar */}
              <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 ${getProficiencyColor(tech.proficiency)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: hoveredTech === tech.name ? getProficiencyWidth(tech.proficiency) : '0%' }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{techData.length}+</div>
          <div className="text-sm text-muted-foreground">Technologies</div>
        </div>
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">8+</div>
          <div className="text-sm text-muted-foreground">Years Experience</div>
        </div>
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{techData.filter(t => t.proficiency === 'expert').length}</div>
          <div className="text-sm text-muted-foreground">Expert Level</div>
        </div>
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{categories.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
      </div>
    </section>
  );
}