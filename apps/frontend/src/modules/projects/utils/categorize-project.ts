import type { TSimpleProject, TProjectData } from '../types';

type ProjectCategory = 'APIs' | 'DX tooling' | 'projects';

/**
 * Predefined project categorization mapping
 */
const PROJECT_CATEGORY_MAPPING: Record<string, ProjectCategory> = {
  // APIs category
  'fync': 'APIs',
  'drizzleasy': 'APIs', 
  'hono-analytics': 'APIs',
  
  // DX tooling category
  'Hygienic': 'DX tooling',
  'hygienic': 'DX tooling',
  'Docki': 'DX tooling',
  'docki': 'DX tooling', 
  'Turso-db-creator-auto-retrieve-env-credentials': 'DX tooling',
  'turso-db-creator-auto-retrieve-env-credentials': 'DX tooling',
  'gh-select': 'DX tooling',
  'dotfiles': 'DX tooling',
  
  // Projects category
  'remcostoeten.nl': 'projects',
  'expenses-calendar': 'projects',
  'nextjs-15-roll-your-own-authentication': 'projects', 
  'emoji-feedback-widget': 'projects',
  'Beautiful-interactive-file-tree': 'projects',
  'beautiful-interactive-file-tree': 'projects',
  'react-beautiful-featurerich-codeblock': 'projects'
};

/**
 * Categorizes a project based on its name, description, technologies, and topics
 */
export function categorizeProject(
  name: string,
  description?: string,
  technologies?: string[],
  topics?: string[]
): ProjectCategory {
  // First check explicit mapping
  const explicitCategory = PROJECT_CATEGORY_MAPPING[name] || PROJECT_CATEGORY_MAPPING[name.toLowerCase()];
  if (explicitCategory) {
    return explicitCategory;
  }

  // Fall back to automatic categorization for unknown projects
  const searchTerms = [
    name.toLowerCase(),
    description?.toLowerCase() || '',
    ...(technologies?.map(tech => tech.toLowerCase()) || []),
    ...(topics?.map(topic => topic.toLowerCase()) || [])
  ].join(' ');

  // API category indicators
  const apiIndicators = [
    'api', 'rest', 'graphql', 'endpoint', 'server', 'backend',
    'hono', 'express', 'fastify', 'nestjs', 'trpc', 'rpc',
    'webhook', 'microservice', 'service', 'lambda', 'vercel-edge',
    'nextjs-api', 'app-router', 'route-handler'
  ];

  // DX tooling category indicators
  const dxToolingIndicators = [
    'cli', 'tool', 'utility', 'script', 'generator', 'builder',
    'devtool', 'dx', 'developer-experience', 'automation',
    'eslint', 'prettier', 'vite', 'webpack', 'rollup', 'babel',
    'typescript', 'jest', 'vitest', 'cypress', 'storybook',
    'config', 'setup', 'boilerplate', 'template', 'scaffold',
    'linter', 'formatter', 'bundler', 'compiler', 'transpiler',
    'crud-generator', 'code-generator'
  ];

  // Check for API indicators
  if (apiIndicators.some(indicator => searchTerms.includes(indicator))) {
    return 'APIs';
  }

  // Check for DX tooling indicators
  if (dxToolingIndicators.some(indicator => searchTerms.includes(indicator))) {
    return 'DX tooling';
  }

  // Default to projects
  return 'projects';
}

/**
 * Groups projects by category
 */
export function groupProjectsByCategory<T extends { category: ProjectCategory }>(
  projects: T[]
): Record<ProjectCategory, T[]> {
  const grouped: Record<ProjectCategory, T[]> = {
    'APIs': [],
    'DX tooling': [],
    'projects': []
  };

  projects.forEach(project => {
    grouped[project.category].push(project);
  });

  return grouped;
}

/**
 * Gets the display order for categories
 */
export function getCategoryOrder(): ProjectCategory[] {
  return ['APIs', 'DX tooling', 'projects'];
}