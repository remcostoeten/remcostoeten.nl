export type ProjectData = {
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

export type SimpleProject = {
  name: string;
  url: string;
};
