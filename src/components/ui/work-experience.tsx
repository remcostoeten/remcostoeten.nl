'use client';

import {
  BriefcaseBusinessIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CodeXmlIcon,
  DraftingCompassIcon,
  GraduationCapIcon,
} from "lucide-react"
import React from "react"
import ReactMarkdown from "react-markdown"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"

const iconMap = {
  code: CodeXmlIcon,
  design: DraftingCompassIcon,
  business: BriefcaseBusinessIcon,
  education: GraduationCapIcon,
} as const

/**
 * Represents the valid keys of the `iconMap` object, used to specify the type of icon
 * associated with an experience position.
 */
export type ExperiencePositionIconType = keyof typeof iconMap

export type ExperiencePositionItemType = {
  /** Unique identifier for the position */
  id: string
  /** The job title or position name */
  title: string
  /** The period during which the position was held (e.g., "Jan 2020 - Dec 2021") */
  employmentPeriod: string
  /** The type of employment (e.g., "Full-time", "Part-time", "Contract") */
  employmentType?: string
  /** A brief description of the position or responsibilities */
  description?: string
  /** An icon representing the position */
  icon?: ExperiencePositionIconType
  /** A list of skills associated with the position */
  skills?: string[]
  /** Indicates if the position details are expanded in the UI */
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

  // Separate experiences into categories
  const currentJob = experiences.find(exp => exp.isCurrentEmployer);
  const education = experiences.find(exp => exp.id === 'education');
  const workHistory = experiences.filter(exp => !exp.isCurrentEmployer && exp.id !== 'education');

  const previewJob = workHistory[0];
  const remainingJobs = workHistory.slice(1);

  return (
    <div className={cn("bg-background px-4", className)}>
      {currentJob && <ExperienceItem key={currentJob.id} experience={currentJob} shouldExpandAll={showAll} />}

      <div className="relative">
        {/* Preview state - shows first job with gradient overlay */}
        <div
          className="grid transition-all duration-500 ease-in-out"
          style={{
            gridTemplateRows: showAll ? '0fr' : '1fr',
            opacity: showAll ? 0 : 1,
          }}
        >
          <div className="overflow-hidden">
            {previewJob && (
              <div className="relative">
                <ExperienceItem key={previewJob.id} experience={previewJob} shouldExpandAll={false} />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Expanded state - shows all jobs */}
        <div
          className="grid transition-all duration-500 ease-in-out"
          style={{
            gridTemplateRows: showAll ? '1fr' : '0fr',
            opacity: showAll ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            {workHistory.map((experience) => (
              <ExperienceItem key={experience.id} experience={experience} shouldExpandAll={true} />
            ))}
          </div>
        </div>

        {workHistory.length > 0 && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-none AAAA hover:bg-muted/50 transition-colors"
            >
              <span
                className="inline-flex transition-transform duration-300"
                style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <ChevronsUpDownIcon className="size-4" />
              </span>
              <span className="transition-opacity duration-300">
                {showAll ? 'Show Less' : `View All Experience (${workHistory.length} more)`}
              </span>
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
  const location = firstPosition?.description && firstPosition.description.split('\n').length === 1
    ? firstPosition.description
    : null;

  return (
    <div className="space-y-4 py-4">
      <div className="not-prose flex items-center gap-3">
        <div className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-none AAAA bg-primary/10 text-primary border border-primary/20">
            <span className="text-xs font-semibold">{initial}</span>
          </div>
        </div>

        <div className="flex flex-1 items-baseline gap-2 overflow-hidden">
          <h3 className="text-lg leading-snug font-medium text-foreground truncate">
            {experience.companyName}
          </h3>
          {location && (
            <span className="text-sm font-normal text-muted-foreground/60 whitespace-nowrap">
              <span className="mx-1 opacity-40">·</span>
              {location}
            </span>
          )}
        </div>

        {experience.isCurrentEmployer && (
          <span className="relative flex items-center justify-center">
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

  if (!canCollapse) {
    return (
      <div className="relative">
        <div className="relative z-1 flex flex-col pl-9">
          <h4 className="text-base font-medium text-foreground tracking-tight">{position.title}</h4>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground/80">
            {position.employmentType && <span>{position.employmentType}</span>}

            <Separator className="h-3 w-[1px] bg-border/50" orientation="vertical" />

            <div className="flex items-center">
              {position.employmentPeriod.split(/(\d{4})/).map((part, i) => {
                const year = Number.parseInt(part)
                return isNaN(year) ? part : <AnimatedNumber key={i} value={year} />
              })}
            </div>
          </div>
        </div>

        {position.description && position.description.split('\n').length > 1 && (
          <Prose className="pt-2 pl-9">
            <ReactMarkdown>{position.description}</ReactMarkdown>
          </Prose>
        )}

        {Array.isArray(position.skills) && position.skills.length > 0 && (
          <ul className="not-prose flex flex-wrap gap-1.5 pt-3 pl-9">
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

  return (
    <Collapsible defaultOpen={position.isExpanded || shouldExpandAll} asChild>
      <div className="relative last:before:absolute last:before:h-full last:before:w-4 last:before:bg-background">
        <CollapsibleTrigger
          className={cn(
            "group/experience not-prose block w-full text-left select-none accordion-smooth",
            "relative before:absolute before:-top-1 before:-right-1 before:-bottom-1.5 before:left-7 before:rounded-none AAAA before:accordion-smooth hover:before:bg-muted/50",
          )}
        >
          <div className="relative z-1 mb-1 flex items-center gap-3">
            <div className="size-6 shrink-0" aria-hidden />

            <h4 className="flex-1 text-base font-medium text-balance text-foreground">{position.title}</h4>

            <div className="shrink-0 text-muted-foreground smooth-transition [&_svg]:size-4" aria-hidden>
              <ChevronsDownUpIcon className="hidden group-data-[state=open]/experience:block smooth-transition" />
              <ChevronsUpDownIcon className="hidden group-data-[state=closed]/experience:block smooth-transition" />
            </div>
          </div>

          <div className="relative z-1 flex items-center gap-2 pl-9 text-sm text-muted-foreground">
            {position.employmentType && (
              <>
                <dl>
                  <dt className="sr-only">Employment Type</dt>
                  <dd>{position.employmentType}</dd>
                </dl>

                <Separator className="data-[orientation=vertical]:h-4" orientation="vertical" />
              </>
            )}

            <dl>
              <dt className="sr-only">Employment Period</dt>
              <dd>
                {position.employmentPeriod.split(/(\d{4})/).map((part, i) => {
                  const year = Number.parseInt(part)
                  return isNaN(year) ? part : <AnimatedNumber key={i} value={year} />
                })}
              </dd>
            </dl>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden accordion-smooth data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {position.description && (
            <Prose className="pt-2 pl-9">
              <ReactMarkdown>{position.description}</ReactMarkdown>
            </Prose>
          )}

          {Array.isArray(position.skills) && position.skills.length > 0 && (
            <ul className="not-prose flex flex-wrap gap-1.5 pt-2 pl-9">
              {position.skills.map((skill, index) => (
                <li key={index} className="flex">
                  <Skill>{skill}</Skill>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none font-mono text-muted-foreground prose-zinc dark:prose-invert",
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
        "inline-flex items-center rounded-none AAAA border bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
