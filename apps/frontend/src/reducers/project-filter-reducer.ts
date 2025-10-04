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

  if (name.includes('next') || name.includes('react') || name.includes('jsx')) {
    topics.push('Next.js')
  }
  
  if (name.includes('ts') || name.includes('type') || name.includes('typescript')) {
    topics.push('TypeScript')
  }
  
  if (name.includes('auth') || name.includes('authentication') || name.includes('login')) {
    topics.push('Authentication')
  }
  
  if (name.includes('db') || name.includes('database') || name.includes('drizzle') || name.includes('turso')) {
    topics.push('Database')
  }
  
  if (name.includes('cli') || name.includes('select') || name.includes('gh-') || name.includes('dotfiles')) {
    topics.push('CLI Tools')
  }
  
  if (name.includes('calendar') || name.includes('expense') || name.includes('tracker')) {
    topics.push('Productivity')
  }
  
  if (name.includes('widget') || name.includes('component') || name.includes('ui')) {
    topics.push('UI Components')
  }
  
  if (name.includes('api') || name.includes('analytics') || name.includes('hono')) {
    topics.push('API & Analytics')
  }
  
  if (name.includes('file') || name.includes('tree') || name.includes('code') && name.includes('block')) {
    topics.push('Developer Tools')
  }
  
  if (name.includes('docker') || name.includes('dock')) {
    topics.push('DevOps')
  }

  if (topics.length === 0) {
    topics.push('Web Development')
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