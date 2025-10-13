'use client';

import { useState } from 'react';
import { ChevronDown, Code2, Users, Zap, Target } from 'lucide-react';
import { TProjectDetails } from '../types';

type TProps = {
  details: TProjectDetails;
  projectName: string;
};

export function ProjectExpandableDetails({ details, projectName }: TProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  return (
    <div className="mt-3">
      <button
        onClick={toggleExpand}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <span>Learn more</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'grid-rows-[1fr] opacity-100 mt-4' 
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            {details.longDescription && (
              <div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {details.longDescription}
                </p>
              </div>
            )}

            {details.problemSolved && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-medium">Problem Solved</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {details.problemSolved}
                </p>
              </div>
            )}

            {details.features && details.features.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-medium">Key Features</h4>
                </div>
                <ul className="space-y-1.5">
                  {details.features.map((feature, index) => (
                    <li 
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                      style={{
                        animation: isExpanded ? `slideIn 0.3s ease-out ${index * 0.1}s both` : 'none'
                      }}
                    >
                      <span className="text-accent mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {details.techStack && details.techStack.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-medium">Tech Stack</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {details.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-accent/10 text-accent rounded border border-accent/20"
                      style={{
                        animation: isExpanded ? `fadeIn 0.4s ease-out ${index * 0.05}s both` : 'none'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {details.targetAudience && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-accent" />
                  <h4 className="text-sm font-medium">Target Audience</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {details.targetAudience}
                </p>
              </div>
            )}

            {details.usageExample && (
              <div>
                <h4 className="text-sm font-medium mb-2">Usage Example</h4>
                <pre className="text-xs bg-background/50 p-3 rounded border border-border overflow-x-auto">
                  <code>{details.usageExample}</code>
                </pre>
              </div>
            )}

            {details.screenshots && details.screenshots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Screenshots</h4>
                <div className="grid grid-cols-2 gap-2">
                  {details.screenshots.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`${projectName} screenshot ${index + 1}`}
                      className="rounded border border-border hover:border-accent/50 transition-colors"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
