type TProjectCategory = 'APIs' | 'DX tooling' | 'projects';

export type TSimpleProject = {
  name: string;
  url: string;
  category: TProjectCategory | TProjectCategory[];
  gitInfo?: TGitInfo;
  packageInfo?: TPackageInfo;
  originLabel?: TOriginLabel;
  anchor?: string;
  detailedInfo?: TProjectDetails;
};

export type TProjectDetails = {
  longDescription?: string;
  features?: string[];
  techStack?: string[];
  screenshots?: string[];
  usageExample?: string;
  highlights?: string[];
  problemSolved?: string;
  targetAudience?: string;
};

export type TPackageInfo = {
  npmUrl?: string;
  githubUrl?: string;
  isPackage?: boolean;
};

export type TOriginLabel = {
  text?: string;
  description?: string;
  color?: 'website' | 'community' | 'personal' | 'client' | 'blog' | 'component' | 'tool' | 'config' | 'tutorial';
  icon?: string;
  blogUrl?: string;
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
  category: TProjectCategory | TProjectCategory[];
  packageInfo?: TPackageInfo;
  originLabel?: TOriginLabel;
  anchor?: string;
};
