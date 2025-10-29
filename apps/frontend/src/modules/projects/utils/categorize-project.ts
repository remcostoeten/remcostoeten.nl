import type { TSimpleProject, TProjectData } from '../types';

type ProjectCategory = 'APIs' | 'DX tooling' | 'projects';
type ProjectCategoryInput = ProjectCategory | ProjectCategory[];

/**
 * Predefined project categorization mapping
 */
const PROJECT_CATEGORY_MAPPING: Record<string, ProjectCategory> = {
  // APIs category
  'fync': 'APIs',
  'drizzleasy': 'APIs',
  'honolytics': 'APIs',

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
  'expense-calendar': 'projects',
  'nextjs-15-roll-your-own-authentication': 'projects',
  'emoji-feedback-widget': 'projects',
  'The most beautifull file tree': 'projects',
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
 * Normalizes category input to always return an array
 */
function normalizeCategoryToArray(category: ProjectCategoryInput): ProjectCategory[] {
  return Array.isArray(category) ? category : [category];
}

/**
 * Gets all categories from a project as an array
 */
export function getProjectCategories(project: { category: ProjectCategoryInput }): ProjectCategory[] {
  return normalizeCategoryToArray(project.category);
}

/**
 * Checks if a project belongs to a specific category
 */
export function projectHasCategory(project: { category: ProjectCategoryInput }, targetCategory: ProjectCategory): boolean {
  const categories = normalizeCategoryToArray(project.category);
  return categories.includes(targetCategory);
}

/**
 * Groups projects by category, handling both single and array categories
 */
export function groupProjectsByCategory<T extends { category: ProjectCategoryInput }>(
  projects: T[]
): Record<ProjectCategory, T[]> {
  const grouped: Record<ProjectCategory, T[]> = {
    'APIs': [],
    'DX tooling': [],
    'projects': []
  };

  projects.forEach(project => {
    const categories = normalizeCategoryToArray(project.category);
    categories.forEach(cat => {
      grouped[cat].push(project);
    });
  });

  return grouped;
}

/**
 * Gets the display order for categories
 */
export function getCategoryOrder(): ProjectCategory[] {
  return ['APIs', 'DX tooling', 'projects'];
}