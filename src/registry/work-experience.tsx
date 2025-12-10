import {
  BriefcaseBusinessIcon,
  CodeXmlIcon,
  DraftingCompassIcon,
  GraduationCapIcon,
} from "lucide-react";
import React from "react";
import ReactMarkdown from 'react-markdown';

import { cn } from "@/lib/utils";

const iconMap = {
  code: CodeXmlIcon,
  design: DraftingCompassIcon,
  business: BriefcaseBusinessIcon,
  education: GraduationCapIcon,
} as const;

export type ExperiencePositionIconType = keyof typeof iconMap;

export type ExperiencePositionItemType = {
  id: string;
  title: string;
  employmentPeriod: string;
  employmentType?: string;
  description?: string;
  icon?: ExperiencePositionIconType;
  skills?: string[];
  isExpanded?: boolean;
};

export type ExperienceItemType = {
  id: string;
  companyName: string;
  companyLogo?: string;
  positions: ExperiencePositionItemType[];
  isCurrentEmployer?: boolean;
};

export function WorkExperience({
  className,
  experiences,
}: {
  className?: string;
  experiences: ExperienceItemType[];
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {experiences.map((experience) => (
        <React.Fragment key={experience.id}>
          {experience.positions.map((position) => (
            <ExperiencePositionItem
              key={position.id}
              position={position}
              companyName={experience.companyName}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ExperiencePositionItem({
  position,
  companyName,
}: {
  position: ExperiencePositionItemType;
  companyName: string;
}) {
  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8 py-3 transition-colors hover:bg-muted/30 px-4 -mx-4 rounded-lg">
      <div className="text-sm text-muted-foreground shrink-0 sm:w-32 font-mono">
        {position.employmentPeriod}
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h4 className="font-medium text-foreground">
            {position.title}
          </h4>
          <span className="text-muted-foreground text-sm">
            @ {companyName}
          </span>
        </div>

        {position.description && (
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            {position.description}
          </p>
        )}
      </div>
    </div>
  );
}