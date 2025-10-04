interface SimpleProject {
  name: string
  url: string
  category: 'APIs' | 'DX tooling' | 'projects'
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

function getProjectCategories(project: SimpleProject): string[] {
  // Use the existing category from the project data
  return [project.category]
}

function filterProjects(projects: SimpleProject[], category: string, searchText: string): SimpleProject[] {
  let filtered = projects

  if (category !== 'All') {
    filtered = filtered.filter(project => 
      getProjectCategories(project).includes(category)
    )
  }

  if (searchText.trim()) {
    const search = searchText.toLowerCase().trim()
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(search) ||
      project.gitInfo?.description?.toLowerCase().includes(search) ||
      project.category.toLowerCase().includes(search)
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

export { projectFilterReducer, initialProjectFilterState, getProjectCategories }
export type { TProjectFilterState, TProjectFilterAction, SimpleProject }