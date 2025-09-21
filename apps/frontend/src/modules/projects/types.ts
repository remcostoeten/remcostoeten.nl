export type TSimpleProject = {
  name: string;
  url: string;
  gitInfo?: TGitInfo;
};

export type TGitInfo = {
  stars?: number;
  forks?: number;
  lastCommit?: string;
  language?: string;
  contributors?: number;
  description?: string;
  totalCommits?: number;
  startDate?: string;
  lastCommitDate?: string;
};

export type TProjectData = {
  title: string;
  description: string;
  url: string;
  demoUrl?: string;
  stars: number;
  forks: number;
  branches: number;
  technologies: string[];
  lastUpdated: string;
  highlights: string[];
  language: string;
  contributors: number;
  totalCommits: number;
  startDate?: string;
};