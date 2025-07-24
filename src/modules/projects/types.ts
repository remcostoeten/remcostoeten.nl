export type TProjectData = {
  title: string;
  description: string;
  url: string;
  demoUrl?: string;
  stars: number;
  branches: number;
  technologies: string[];
  lastUpdated: string;
  highlights: string[];
};

export type TSimpleProject = {
  name: string;
  url: string;
};
