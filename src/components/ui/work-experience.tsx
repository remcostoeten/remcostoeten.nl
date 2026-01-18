"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
    BriefcaseBusinessIcon,
    ChevronsDownUpIcon,
    ChevronsUpDownIcon,
    CodeXmlIcon,
    DraftingCompassIcon,
    GraduationCapIcon,
    TerminalIcon
} from "lucide-react"
import React from "react"
import ReactMarkdown from "react-markdown"

const iconMap = {
    code: CodeXmlIcon,
    design: DraftingCompassIcon,
    business: BriefcaseBusinessIcon,
    education: GraduationCapIcon,
    shell: TerminalIcon,
    bash: TerminalIcon,
    unix: TerminalIcon
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
    experiences
}: {
    className?: string
    experiences: ExperienceItemType[]
}) {
    const [showAll, setShowAll] = React.useState(false)

    const currentJob = experiences.find(exp => exp.isCurrentEmployer)
    const education = experiences.find(exp => exp.id === "education")
    const workHistory = experiences.filter(
        exp => !exp.isCurrentEmployer && exp.id !== "education"
    )

    const previewJob = workHistory[0]
    const remainingJobs = workHistory.slice(1)

    return (
        <div className={cn("bg-background px-4", className)}>
            {currentJob && (
                <ExperienceItem
                    key={currentJob.id}
                    experience={currentJob}
                    shouldExpandAll={true}
                />
            )}

            <div className="space-y-4">
                <div
                    className={cn(
                        "relative transition-all duration-700 ease-in-out",
                        showAll
                            ? "max-h-[2000px]"
                            : "max-h-[200px] overflow-hidden"
                    )}
                >
                    {previewJob && (
                        <ExperienceItem
                            key={previewJob.id}
                            experience={previewJob}
                            shouldExpandAll={true}
                        />
                    )}

                    <div
                        className={cn(
                            "space-y-4 transition-all duration-700",
                            showAll
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4 pointer-events-none"
                        )}
                    >
                        {remainingJobs.map(experience => (
                            <ExperienceItem
                                key={experience.id}
                                experience={experience}
                                shouldExpandAll={true}
                            />
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
                                <span>
                                    View All Experience ({remainingJobs.length}{" "}
                                    more)
                                </span>
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
                <ExperienceItem
                    key={education.id}
                    experience={education}
                    shouldExpandAll={showAll}
                />
            )}
        </div>
    )
}

export function ExperienceItem({
    experience,
    shouldExpandAll = false
}: {
    experience: ExperienceItemType
    shouldExpandAll?: boolean
}) {
    const initial = experience.companyName.charAt(0).toUpperCase()

    return (
        <div className="relative pb-8 last:pb-0">
            {/* Vertical Timeline Line */}
            <div
                className="absolute left-[15px] top-0 bottom-0 w-px bg-border/40"
                aria-hidden="true"
            />

            {/* Company Header Node */}
            <div className="relative flex items-center gap-4 mb-6 group">
                <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors group-hover:border-foreground/20 group-hover:text-foreground">
                    <span className="text-sm font-semibold">{initial}</span>
                    {experience.isCurrentEmployer && (
                        <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-background bg-brand-500" />
                    )}
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground tracking-tight">
                            {experience.companyName}
                        </h3>
                        {experience.isCurrentEmployer && (
                            <span className="inline-flex items-center rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-500">
                                Current
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Positions List */}
            <div className="space-y-8">
                {experience.positions.map((position, index) => (
                    <ExperiencePositionItem
                        key={position.id}
                        position={position}
                        shouldExpandAll={shouldExpandAll}
                        isLast={index === experience.positions.length - 1}
                    />
                ))}
            </div>
        </div>
    )
}

export function ExperiencePositionItem({
    position,
    shouldExpandAll = false,
    isLast
}: {
    position: ExperiencePositionItemType
    shouldExpandAll?: boolean
    isLast?: boolean
}) {
    const hasContent =
        (position.description && position.description.trim().length > 0) ||
        (Array.isArray(position.skills) && position.skills.length > 0)
    const isEducation = position.id.startsWith("education")
    const canCollapse = hasContent && !isEducation

    const [isOpen, setIsOpen] = React.useState(
        position.isExpanded || shouldExpandAll
    )
    const Icon = position.icon ? iconMap[position.icon] : CodeXmlIcon

    React.useEffect(() => {
        if (shouldExpandAll) {
            setIsOpen(true)
        }
    }, [shouldExpandAll])

    const Metadata = () => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-2 font-mono">
            {position.employmentType && (
                <>
                    <span>{position.employmentType}</span>
                    <span>·</span>
                </>
            )}
            <div className="flex items-center">{position.employmentPeriod}</div>
        </div>
    )

    return (
        <div className="relative pl-12">
            <div className="absolute left-[3.5px] top-0 z-10 box-border flex size-6 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground shadow-sm">
                <Icon className="size-3" />
            </div>

            <div className="flex flex-col">
                <div
                    className={cn(
                        "flex items-start justify-between select-none",
                        canCollapse && "group/header cursor-pointer"
                    )} tabIndex={-1}
                    onClick={() => canCollapse && setIsOpen(!isOpen)}
                >
                    <div>
                        <h4
                            className={cn(
                                "text-sm font-medium text-foreground/90 transition-colors",
                                canCollapse &&
                                "group-hover/header:text-foreground"
                            )}
                        >
                            {position.title}
                        </h4>
                        <Metadata />
                    </div>

                    {canCollapse && (
                        <button
                            type="button"
                            tabIndex={-1}
                            className="text-muted-foreground/40 hover:text-foreground transition-colors"
                            aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                            {isOpen ? (
                                <ChevronsDownUpIcon className="size-3.5" />
                            ) : (
                                <ChevronsUpDownIcon className="size-3.5" />
                            )}
                        </button>
                    )}
                </div>

                <AnimatePresence initial={false}>
                    {(isOpen || !canCollapse) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 pb-1">
                                {position.description && (
                                    <Prose>
                                        <ReactMarkdown>
                                            {position.description}
                                        </ReactMarkdown>
                                    </Prose>
                                )}

                                {Array.isArray(position.skills) &&
                                    position.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-3">
                                            {position.skills.map(
                                                (skill, index) => (
                                                    <Skill key={index}>
                                                        {skill}
                                                    </Skill>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function Prose({ className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "prose prose-sm max-w-none text-muted-foreground prose-zinc dark:prose-invert",
                "prose-p:leading-normal prose-p:my-0",
                "prose-ul:my-2 prose-ul:list-none prose-ul:pl-0 prose-ul:m-0",
                "prose-li:relative prose-li:pl-0 prose-li:my-1 prose-li:leading-relaxed prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-0 prose-li:before:content-['-'] prose-li:before:font-medium prose-li:before:text-muted-foreground/80",
                "prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

function Skill({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md border border-border/50 bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary hover:text-secondary-foreground",
                className
            )}
            {...props}
        />
    )
}
