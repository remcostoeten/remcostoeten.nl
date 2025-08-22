import { useState } from 'react';
import { GitHubProjectCard } from './project-card';

type TWidgetProps = {
  type: string;
  props: any;
}

type TProjectWidgetProps = {
  text: string;
  url: string;
  fontSize: string;
  githubOwner?: string;
  githubRepo?: string;
}

function ProjectWidget({ text, url, fontSize, githubOwner, githubRepo }: TProjectWidgetProps) {
  const [showCard, setShowCard] = useState(false);
  
  let finalOwner = githubOwner;
  let finalRepo = githubRepo;
  
  if ((!finalOwner || !finalRepo) && url) {
    const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (githubMatch) {
      finalOwner = finalOwner || githubMatch[1];
      finalRepo = finalRepo || githubMatch[2];
    }
  }
  
  const hasGitHubData = finalOwner && finalRepo;

  return (
    <div className="relative inline-block">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[hsl(var(--accent))] hover:underline font-medium ${fontSize}`}
        onMouseEnter={() => hasGitHubData && setShowCard(true)}
        onMouseLeave={() => setTimeout(() => setShowCard(false), 200)}
      >
        {text}
      </a>
      
      {hasGitHubData && showCard && (
        <div 
          className="absolute top-full left-0 mt-2 z-50"
          onMouseEnter={() => setShowCard(true)}
          onMouseLeave={() => setShowCard(false)}
        >
          <GitHubProjectCard owner={finalOwner!} repo={finalRepo!} />
        </div>
      )}
    </div>
  );
}

export function Widget({ type, props }: TWidgetProps) {
  function parseHighlightedText(text: string) {
    const parts = text.split(/(\[highlight:[^\]]+:[^\]]+\]|\[project:[^\]]+:[^\]]+(?::[^\]]+:[^\]]+)?\]|\[link:[^\]]+:[^\]]+\]|\[dynamic:[^\]]+\])/g);
    return parts.map((part, index) => {
      const highlightMatch = part.match(/\[highlight:([^:]+):([^\]]+)\]/);
      if (highlightMatch) {
        const [, text, type] = highlightMatch;
        const colorClasses = {
          yellow: 'bg-yellow-200 text-yellow-900',
          green: 'bg-green-200 text-green-900',
          blue: 'bg-blue-200 text-blue-900',
          purple: 'bg-purple-200 text-purple-900',
          pink: 'bg-pink-200 text-pink-900',
          orange: 'bg-orange-200 text-orange-900',
          frontend: 'bg-[hsl(var(--highlight))] text-black',
          product: 'bg-[hsl(var(--highlight-product))] text-black',
        };
        const colorClass = colorClasses[type.toLowerCase() as keyof typeof colorClasses] || 'bg-yellow-200 text-yellow-900';
        return (
          <span
            key={index}
            className={`${colorClass} px-1 rounded`}
          >
            {text}
          </span>
        );
      }

      
      const projectMatch = part.match(/\[project:([^:]+):([^:]+)(?::([^:]+):([^\]]+))?\]/);
      if (projectMatch) {
        const [, text, url, owner, repo] = projectMatch;
        return (
          <ProjectWidget
            key={index}
            text={text}
            url={url}
            fontSize="text-base"
            githubOwner={owner || ""}
            githubRepo={repo || ""}
          />
        );
      }

      
      const linkMatch = part.match(/\[link:([^:]+):([^\]]+)\]/);
      if (linkMatch) {
        const [, text, url] = linkMatch;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--accent))] hover:underline"
          >
            {text}
          </a>
        );
      }

      
      const dynamicMatch = part.match(/\[dynamic:([^\]]+)\]/);
      if (dynamicMatch) {
        const [, type] = dynamicMatch;
        if (type === 'current-time') {
          return (
            <span key={index} className="font-mono text-[hsl(var(--accent))]">
              {new Date().toLocaleTimeString('en-US', {
                timeZone: 'Europe/Amsterdam',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })} CET
            </span>
          );
        }
        return <span key={index}>{type}</span>;
      }

      return part;
    });
  };

  switch (type) {
    case 'heading':
      const level = props.level || 1;
      const headingProps = {
        className: `${props.fontSize || 'text-2xl'} ${props.fontWeight || 'font-bold'} ${props.color || 'text-[hsl(var(--foreground))]'} ${props.textAlign || 'text-left'}`,
        children: parseHighlightedText(props.text)
      };
      
      if (level === 1) return <h1 {...headingProps} />;
      if (level === 2) return <h2 {...headingProps} />;
      if (level === 3) return <h3 {...headingProps} />;
      if (level === 4) return <h4 {...headingProps} />;
      if (level === 5) return <h5 {...headingProps} />;
      if (level === 6) return <h6 {...headingProps} />;
      return <h1 {...headingProps} />;

    case 'text':
      return (
        <p
          className={`${props.fontSize || 'text-base'} ${props.fontWeight || 'font-normal'} ${props.color || 'text-[hsl(var(--foreground))]'} ${props.textAlign || 'text-left'}`}
        >
          {parseHighlightedText(props.text)}
        </p>
      );

    case 'highlightedText':
      return (
        <span
          className={`bg-[hsl(var(--accent))] text-black px-2 py-1 rounded ${props.fontSize || 'text-base'} ${props.fontWeight || 'font-normal'}`}
        >
          {props.text}
        </span>
      );

    case 'coloredTextLink':
      return (
        <a
          href={props.href || '#'}
          className={`text-[hsl(var(--accent))] hover:underline ${props.fontSize || 'text-base'} ${props.fontWeight || 'font-normal'}`}
          target={props.target || '_self'}
        >
          {props.text}
        </a>
      );

    case 'project':
      return (
        <ProjectWidget
          text={props.text}
          url={props.url || '#'}
          fontSize={props.fontSize || 'text-base'}
          githubOwner={props.githubOwner}
          githubRepo={props.githubRepo}
        />
      );

    case 'link':
      return (
        <a
          href={props.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[hsl(var(--accent))] hover:underline ${props.fontSize || 'text-base'} ${props.fontWeight || 'font-normal'}`}
        >
          {props.text}
        </a>
      );

    case 'dynamic':
      if (props.type === 'current-time') {
        return (
          <span className="font-mono text-[hsl(var(--accent))]">
            {new Date().toLocaleTimeString('en-US', {
              timeZone: 'Europe/Amsterdam',
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            })} CET
          </span>
        );
      }
      return <span>{props.type}</span>;

    default:
      return <div>Unknown widget type: {type}</div>;
  }
}
