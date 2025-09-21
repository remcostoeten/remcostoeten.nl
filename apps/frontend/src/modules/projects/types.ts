export type TSimpleProject = {
  name: string;
  url: string;
  gitInfo: TGitInfo;
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
  deploymentUrl?: string;
  url?: string;
  stars: number;
  forks: number;
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