interface SimpleProject {
  name: string
  url: string
  gitInfo?: {
    stars?: number
    forks?: number
    lastCommit?: string
    language?: string
    contributors?: number
    description?: string
    totalCommits?: number
    startDate?: string
    lastCommitDate?: string
  }
}

type TProjectFilterState = {
  currentCategory: string
  searchText: string
  allProjects: SimpleProject[]
  filteredProjects: SimpleProject[]
}

type TProjectFilterAction =
  | { type: 'SET_PROJECTS'; payload: SimpleProject[] }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'RESET' }

function getProjectTopics(projectName: string): string[] {
  const topics: string[] = []
  const name = projectName.toLowerCase()

  // Map to the three main categories: API's, DX tooling, and projects
  if (name.includes('api') || name.includes('hono') || name.includes('endpoint') || name.includes('server') ||
      name.includes('rest') || name.includes('graphql') || name.includes('rpc') || name.includes('webhook')) {
    topics.push("API's")
  }

  if (name.includes('cli') || name.includes('tool') || name.includes('utility') || name.includes('script') ||
      name.includes('generator') || name.includes('builder') || name.includes('crud') || name.includes('devtool') ||
      name.includes('dx') || name.includes('eslint') || name.includes('prettier') || name.includes('vite') ||
      name.includes('webpack') || name.includes('rollup') || name.includes('babel') || name.includes('typescript') ||
      name.includes('jest') || name.includes('vitest') || name.includes('cypress') || name.includes('storybook')) {
    topics.push('DX tooling')
  }

  // If it's not API's or DX tooling, categorize as projects (most common case)
  if (topics.length === 0) {
    topics.push('projects')
  }

  return topics
}

function filterProjects(projects: SimpleProject[], category: string, searchText: string): SimpleProject[] {
  let filtered = projects

  if (category !== 'All') {
    filtered = filtered.filter(project => 
      getProjectTopics(project.name).includes(category)
    )
  }

  if (searchText.trim()) {
    const search = searchText.toLowerCase().trim()
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(search) ||
      project.gitInfo?.description?.toLowerCase().includes(search) ||
      getProjectTopics(project.name).some(topic => topic.toLowerCase().includes(search))
    )
  }

  return filtered
}

function projectFilterReducer(state: TProjectFilterState, action: TProjectFilterAction): TProjectFilterState {
  switch (action.type) {
    case 'SET_PROJECTS': {
      const filteredProjects = filterProjects(action.payload, state.currentCategory, state.searchText)
      return {
        ...state,
        allProjects: action.payload,
        filteredProjects
      }
    }
    
    case 'SET_CATEGORY': {
      const filteredProjects = filterProjects(state.allProjects, action.payload, state.searchText)
      return {
        ...state,
        currentCategory: action.payload,
        filteredProjects
      }
    }
    
    case 'SET_SEARCH': {
      const filteredProjects = filterProjects(state.allProjects, state.currentCategory, action.payload)
      return {
        ...state,
        searchText: action.payload,
        filteredProjects
      }
    }
    
    case 'RESET': {
      return {
        currentCategory: 'All',
        searchText: '',
        allProjects: state.allProjects,
        filteredProjects: state.allProjects
      }
    }
    
    default:
      return state
  }
}

const initialProjectFilterState: TProjectFilterState = {
  currentCategory: 'All',
  searchText: '',
  allProjects: [],
  filteredProjects: []
}

export { projectFilterReducer, initialProjectFilterState, getProjectTopics }
export type { TProjectFilterState, TProjectFilterAction, SimpleProject }