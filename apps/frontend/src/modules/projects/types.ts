export type TSimpleProject = {
  name: string;
  url: string;
  gitInfo: TGitInfo;
  index: number;
};

export type TGitInfo = {
  stars: number;
  forks: number;
  lastCommit: string;
  language: string;
  contributors: number;
  description: string;
  totalCommits: number;
  startDate?: string;
  lastCommitDate?: string;
};

export type TProjectData = {
  title: string;
  deploymentUrl?: string;
  url?: string;
  demoUrl?: string;
  stars: number;
  forks: number;
  branches?: number;
  technologies?: string[];
  highlights?: string[];
  latestCommit?: {
    message: string;
    age: string;
    date: string;
  };
  lastUpdated: string;
  language: string;
  contributors: number;
  description: string;
  totalCommits: number;
  startDate?: string;
};