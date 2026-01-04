import type { Category } from './types'

export const ALL_CATEGORIES: Category[] = [
  // Development
  {
    id: 'development',
    label: 'Development',
    description: 'General development projects'
  },
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'Client-side web development'
  },
  {
    id: 'backend',
    label: 'Backend',
    description: 'Server-side development'
  },
  {
    id: 'fullstack',
    label: 'Full Stack',
    description: 'End-to-end application development'
  },

  // Web & Performance
  {
    id: 'web',
    label: 'Web',
    description: 'Web applications and websites'
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'Optimization and speed-focused projects'
  },
  {
    id: 'edge',
    label: 'Edge',
    description: 'Edge computing and CDN projects'
  },

  // E-commerce
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Online stores and payment systems'
  },

  // Collaboration & Realtime
  {
    id: 'collaboration',
    label: 'Collaboration',
    description: 'Team and collaborative tools'
  },
  {
    id: 'realtime',
    label: 'Realtime',
    description: 'Real-time data and communication'
  },
  {
    id: 'api',
    label: 'API',
    description: 'API development and integration'
  },

  // Design & UI
  {
    id: 'design',
    label: 'Design',
    description: 'UI/UX and design projects'
  },
  {
    id: 'ui',
    label: 'UI Components',
    description: 'User interface components and libraries'
  },
  {
    id: 'ux',
    label: 'UX',
    description: 'User experience and interaction design'
  },
  {
    id: 'animation',
    label: 'Animation',
    description: 'Motion and animation projects'
  },

  // Content & CMS
  {
    id: 'content',
    label: 'Content',
    description: 'Content management and delivery'
  },
  {
    id: 'cms',
    label: 'CMS',
    description: 'Content management systems'
  },
  {
    id: 'blog',
    label: 'Blog',
    description: 'Blogging and content platforms'
  },

  // Portfolio & Personal
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Personal and professional portfolios'
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'Personal projects and experiments'
  },

  // Tools & Utilities
  {
    id: 'tools',
    label: 'Tools',
    description: 'Development tools and utilities'
  },
  {
    id: 'cli',
    label: 'CLI',
    description: 'Command-line interface tools'
  },
  {
    id: 'automation',
    label: 'Automation',
    description: 'Automation and scripting'
  },
  {
    id: 'extensions',
    label: 'Extensions',
    description: 'Browser and IDE extensions'
  },
  {
    id: 'plugins',
    label: 'Plugins',
    description: 'Plugins and add-ons'
  },

  // Data & Database
  {
    id: 'database',
    label: 'Database',
    description: 'Database and data storage'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Analytics and tracking'
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    description: 'System and application monitoring'
  },

  // Authentication & Security
  {
    id: 'auth',
    label: 'Authentication',
    description: 'Authentication and authorization'
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Security and privacy-focused projects'
  },

  // Infrastructure & DevOps
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Infrastructure and deployment'
  },
  {
    id: 'devops',
    label: 'DevOps',
    description: 'DevOps and CI/CD projects'
  },
  {
    id: 'cloud',
    label: 'Cloud',
    description: 'Cloud computing and services'
  },

  // Testing & Quality
  {
    id: 'testing',
    label: 'Testing',
    description: 'Testing and quality assurance'
  },
  {
    id: 'qa',
    label: 'Quality Assurance',
    description: 'QA and testing frameworks'
  },

  // Mobile
  {
    id: 'mobile',
    label: 'Mobile',
    description: 'Mobile applications'
  },
  {
    id: 'ios',
    label: 'iOS',
    description: 'iOS development'
  },
  {
    id: 'android',
    label: 'Android',
    description: 'Android development'
  },

  // Desktop
  {
    id: 'desktop',
    label: 'Desktop',
    description: 'Desktop applications'
  },
  {
    id: 'electron',
    label: 'Electron',
    description: 'Electron-based applications'
  },
  {
    id: 'tauri',
    label: 'Tauri',
    description: 'Tauri-based applications'
  },

  // AI & Machine Learning
  {
    id: 'ai',
    label: 'AI',
    description: 'Artificial Intelligence projects'
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    description: 'Machine learning and data science'
  },
  {
    id: 'llm',
    label: 'LLM',
    description: 'Large Language Model integrations'
  },

  // Gaming
  {
    id: 'gaming',
    label: 'Gaming',
    description: 'Game development and interactive projects'
  },
  {
    id: 'interactive',
    label: 'Interactive',
    description: 'Interactive experiences'
  },

  // Learning & Education
  {
    id: 'learning',
    label: 'Learning',
    description: 'Educational projects and tutorials'
  },
  {
    id: 'tutorial',
    label: 'Tutorial',
    description: 'Tutorial and demo projects'
  },
  {
    id: 'documentation',
    label: 'Documentation',
    description: 'Documentation and guides'
  },

  // Open Source
  {
    id: 'opensource',
    label: 'Open Source',
    description: 'Open source projects'
  },
  {
    id: 'library',
    label: 'Library',
    description: 'Reusable libraries and packages'
  },
  {
    id: 'framework',
    label: 'Framework',
    description: 'Frameworks and scaffolds'
  },

  // Experimental
  {
    id: 'experimental',
    label: 'Experimental',
    description: 'Experimental and cutting-edge projects'
  },
  {
    id: 'prototype',
    label: 'Prototype',
    description: 'Prototypes and MVPs'
  },

  // Other
  {
    id: 'other',
    label: 'Other',
    description: 'Other miscellaneous projects'
  }
]

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find(cat => cat.id === id)
}

export function getCategoryIds(): string[] {
  return ALL_CATEGORIES.map(cat => cat.id)
}

export function getCategoryLabels(): Record<string, string> {
  const labels: Record<string, string> = {}
  ALL_CATEGORIES.forEach(cat => {
    labels[cat.id] = cat.label
  })
  return labels
}
