export interface ProjectData {
  title: string;
  description: string;
  url: string;
  demoUrl?: string;
  stars: number;
  branches: number;
  technologies: string[];
  lastUpdated: string;
  highlights: string[];
}

export interface SimpleProject {
  name: string;
  url: string;
  gitInfo?: {
    stars: number;
    forks: number;
    lastCommit: string;
    language: string;
    contributors: number;
    description: string;
    totalCommits?: number;
    startDate?: string;
    lastCommitDate?: string;
  };
}