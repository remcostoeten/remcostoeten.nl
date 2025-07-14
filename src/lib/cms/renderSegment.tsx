import { ProjectCard } from '@/components/project-card';
import { LastCommit } from '@/components/dynamic-data/last-commit';
import { NowPlaying } from '@/components/dynamic-data/now-playing';
import { TContentSegment } from './types';

type TProjectMeta = {
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

export function renderSegment(segment: TContentSegment) {
  switch (segment.type) {
    case 'highlighted':
      return (
        <span
          key={segment.id}
          className="font-medium px-1 py-0.5 rounded"
          style={{
            backgroundColor: 'hsl(var(--highlight-frontend) / 0.2)',
            color: 'hsl(var(--highlight-frontend))',
          }}
        >
          {segment.content}
        </span>
      );

    case 'link':
      return (
        <a
          key={segment.id}
          href={segment.href || '#'}
          target={segment.target || '_blank'}
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium"
        >
          {segment.content} ↗
        </a>
      );

    case 'project-card': {
      // Try to parse project data from metadata field
      if (segment.metadata) {
        try {
          const projectData: TProjectMeta = JSON.parse(segment.metadata);
          if (projectData && projectData.title) {
            return <ProjectCard key={segment.id} {...projectData} />;
          }
        } catch (error) {
          console.error('Failed to parse project metadata:', error);
        }
      }
      
      // Fallback for segments without proper metadata
      return (
        <span key={segment.id} className='font-medium text-accent'>
          {segment.content}
        </span>
      );
    }

    case 'github-commits':
      return (
        <span key={segment.id}>
          <LastCommit repo={segment.metadata || 'remcostoeten/remcostoeten.nl'} />
        </span>
      );

    case 'spotify-now-playing':
      return (
        <span key={segment.id}>
          <NowPlaying />
        </span>
      );

    case 'api-endpoint':
      return (
        <span key={segment.id}>
          {segment.content}
        </span>
      );

    default:
      return <span key={segment.id}>{segment.content}</span>;
  }
}
