'use client';

import {
  BriefcaseBusinessIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CodeXmlIcon,
  DraftingCompassIcon,
  GraduationCapIcon,
  TerminalIcon,
} from "lucide-react"
import React from "react"
import ReactMarkdown from "react-markdown"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/effects/animated-number"

const iconMap = {
  code: CodeXmlIcon,
  design: DraftingCompassIcon,
  business: BriefcaseBusinessIcon,
  education: GraduationCapIcon,
  shell: TerminalIcon,
  bash: TerminalIcon,
  unix: TerminalIcon,
} as const

/**
 * Represents the valid keys of the `iconMap` object, used to specify the type of icon
 * associated with an experience position.
 */
export type ExperiencePositionIconType = keyof typeof iconMap

export type ExperiencePositionItemType = {
  id: string
  title: string
  employmentPeriod: string
  employmentType?: string
  location?: string
  description?: string
  icon?: ExperiencePositionIconType
  skills?: string[]
  isExpanded?: boolean
}

export type ExperienceItemType = {
  /** Unique identifier for the experience item */
  id: string
  /** Name of the company where the experience was gained */
  companyName: string
  /** URL or path to the company's logo image */
  companyLogo?: string
  /** List of positions held at the company */
  positions: ExperiencePositionItemType[]
  /** Indicates if this is the user's current employer */
  isCurrentEmployer?: boolean
}

export function WorkExperience({
  className,
  experiences,
}: {
  className?: string
  experiences: ExperienceItemType[]
}) {
  const [showAll, setShowAll] = React.useState(false);

  const currentJob = experiences.find(exp => exp.isCurrentEmployer);
  const education = experiences.find(exp => exp.id === 'education');
  const workHistory = experiences.filter(exp => !exp.isCurrentEmployer && exp.id !== 'education');

  const previewJob = workHistory[0];
  const remainingJobs = workHistory.slice(1);

  return (
    <div className={cn("bg-background px-4", className)}>
      {currentJob && <ExperienceItem key={currentJob.id} experience={currentJob} shouldExpandAll={true} />}

      <div className="space-y-4">
        <div 
          className={cn(
            "relative transition-all duration-700 ease-in-out",
            showAll ? "max-h-[2000px]" : "max-h-[200px] overflow-hidden"
          )}
        >
          {previewJob && (
            <ExperienceItem key={previewJob.id} experience={previewJob} shouldExpandAll={true} />
          )}

          <div className={cn(
            "space-y-4 transition-all duration-700",
            showAll ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}>
            {remainingJobs.map((experience) => (
              <ExperienceItem key={experience.id} experience={experience} shouldExpandAll={true} />
            ))}
          </div>

          {!showAll && remainingJobs.length > 0 && (
            <div 
              className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/95 to-transparent z-30 flex items-end justify-center pb-4"
              aria-hidden="true"
            >
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-none hover:bg-muted/50 transition-colors pointer-events-auto"
              >
                <ChevronsUpDownIcon className="size-4" />
                <span>View All Experience ({remainingJobs.length} more)</span>
              </button>
            </div>
          )}
        </div>

        {showAll && remainingJobs.length > 0 && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-none hover:bg-muted/50 transition-colors"
            >
              <ChevronsDownUpIcon className="size-4 rotate-180" />
              <span>Show Less</span>
            </button>
          </div>
        )}
      </div>

      {education && (
        <div className="border-t border-border pt-4 mt-4">
          <ExperienceItem key={education.id} experience={education} shouldExpandAll={showAll} />
        </div>
      )}
    </div>
  )
}

export function ExperienceItem({
  experience,
  shouldExpandAll = false,
}: {
  experience: ExperienceItemType
  shouldExpandAll?: boolean
}) {
  const initial = experience.companyName.charAt(0).toUpperCase();
  const firstPosition = experience.positions[0];

  return (
    <div className="space-y-4 py-4">
      <div className="not-prose flex items-start gap-4" style={{ marginBottom: '0' }}>
        <div className="flex size-6 shrink-0 items-center justify-center mt-0.5" aria-hidden>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary border border-primary/20">
            <span className="text-xs font-semibold">{initial}</span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base leading-snug font-medium text-foreground truncate">
              {firstPosition.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {experience.companyName}
            </p>
          </div>
          {firstPosition.location && (
            <span className="text-sm text-muted-foreground/70 whitespace-nowrap">
              {firstPosition.location}
            </span>
          )}
        </div>

        {experience.isCurrentEmployer && (
          <span className="relative flex items-center justify-center translate-y-1">
            <span className="absolute inline-flex size-3 animate-ping rounded-full bg-brand-500 opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
            <span className="sr-only">Current Employer</span>
          </span>
        )}
      </div>

      <div className="relative space-y-4 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
        {experience.positions.map((position) => (
          <ExperiencePositionItem key={position.id} position={position} shouldExpandAll={shouldExpandAll} />
        ))}
      </div>
    </div>
  )
}

export function ExperiencePositionItem({
  position,
  shouldExpandAll = false,
}: {
  position: ExperiencePositionItemType
  shouldExpandAll?: boolean
}) {
  const hasContent = (position.description && position.description.trim().length > 0) || (Array.isArray(position.skills) && position.skills.length > 0);
  const isEducation = position.id.startsWith('education');
  const canCollapse = hasContent && !isEducation;

  const Metadata = () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
      {position.employmentType && (
        <>
          <span>{position.employmentType}</span>
          <Separator className="h-4" orientation="vertical" />
        </>
      )}
      <div className="flex items-center">
        {position.employmentPeriod.split(/(\d{4})/).map((part, i) => {
          const year = Number.parseInt(part)
          return isNaN(year) ? part : <AnimatedNumber key={i} value={year} initialProgress={0} />
        })}
      </div>
    </div>
  );

  if (!canCollapse) {
    return (
      <div className="relative pl-10">
        <Metadata />
        {position.description && (
          <Prose className="pt-2">
            <ReactMarkdown>{position.description}</ReactMarkdown>
          </Prose>
        )}
        {Array.isArray(position.skills) && position.skills.length > 0 && (
          <ul className="not-prose flex flex-wrap gap-1.5 pt-3">
            {position.skills.map((skill, index) => (
              <li key={index} className="flex">
                <Skill>{skill}</Skill>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const [isOpen, setIsOpen] = React.useState(position.isExpanded || shouldExpandAll)
  
  React.useEffect(() => {
    if (shouldExpandAll) {
      setIsOpen(true)
    }
  }, [shouldExpandAll])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <div className="relative last:before:absolute last:before:h-full last:before:w-4 last:before:bg-background">
        <CollapsibleTrigger
          className={cn(
            "group/experience not-prose w-full text-left select-none",
            "flex items-center justify-between pl-10 pr-4 py-0.5",
          )}
        >
          <Metadata />
          <div className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors [&_svg]:size-4" aria-hidden>
            <ChevronsDownUpIcon className="hidden group-data-[state=open]/experience:block" />
            <ChevronsUpDownIcon className="hidden group-data-[state=closed]/experience:block" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="grid transition-[grid-template-rows] duration-300 ease-out data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]">
          <div className="overflow-hidden min-h-0">
            <div className="pl-10 pr-4">
            {position.description && (
              <Prose className="pt-2">
                <ReactMarkdown>{position.description}</ReactMarkdown>
              </Prose>
            )}

            {Array.isArray(position.skills) && position.skills.length > 0 && (
              <ul className="not-prose flex flex-wrap gap-1.5 pt-3">
                {position.skills.map((skill, index) => (
                  <li key={index} className="flex">
                    <Skill>{skill}</Skill>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none font-mono text-muted-foreground prose-zinc dark:prose-invert prose-ul:pl-4 prose-li:pl-0",
        "prose-a:font-medium prose-a:wrap-break-word prose-a:text-foreground prose-a:underline prose-a:underline-offset-4",
        "prose-code:rounded-md prose-code:border prose-code:bg-muted/50 prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
        className,
      )}
      {...props}
    />
  )
}

function Skill({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
