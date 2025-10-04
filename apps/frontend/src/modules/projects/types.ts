export type TSimpleProject = {
  name: string;
  url: string;
  category: 'APIs' | 'DX tooling' | 'projects';
  gitInfo?: TGitInfo;
  packageInfo?: TPackageInfo;
  originLabel?: TOriginLabel;
};

export type TPackageInfo = {
  npmUrl?: string;
  githubUrl?: string;
  isPackage?: boolean;
};

export type TOriginLabel = {
  text: string;
  description?: string;
  color?: 'website' | 'community' | 'personal' | 'client';
  icon?: string;
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
  category: 'APIs' | 'DX tooling' | 'projects';
  packageInfo?: TPackageInfo;
  originLabel?: TOriginLabel;
};
