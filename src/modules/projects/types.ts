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
}