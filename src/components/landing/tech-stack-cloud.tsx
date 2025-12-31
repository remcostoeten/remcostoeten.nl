'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import {
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiTailwindcss,
  SiDrizzle,
  SiDocker
} from 'react-icons/si'

type TechItem = {
  name: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

const LOGOS: TechItem[] = [
  { name: 'next', label: 'Next.js', Icon: SiNextdotjs },
  { name: 'react', label: 'React', Icon: SiReact },
  { name: 'typescript', label: 'TypeScript', Icon: SiTypescript },
  { name: 'tailwind', label: 'Tailwind CSS', Icon: SiTailwindcss },
  { name: 'node', label: 'Node.js', Icon: SiNodedotjs },
  { name: 'postgres', label: 'PostgreSQL', Icon: SiPostgresql },
  { name: 'drizzle', label: 'Drizzle ORM', Icon: SiDrizzle },
  { name: 'docker', label: 'Docker', Icon: SiDocker },
]

const CARD_STYLES = [
  {
    className: "relative border-r border-b bg-secondary dark:bg-secondary/30",
    decorators: (
      <Plus
        className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground/50"
        strokeWidth={1}
      />
    )
  },
  {
    className: "border-b md:border-r",
    decorators: null
  },
  {
    className: "relative border-r border-b md:bg-secondary dark:md:bg-secondary/30",
    decorators: (
      <>
        <Plus
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground/50"
          strokeWidth={1}
        />
        <Plus
          className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden size-6 md:block text-muted-foreground/50"
          strokeWidth={1}
        />
      </>
    )
  },
  {
    className: "relative border-b bg-secondary md:bg-background dark:bg-secondary/30 md:dark:bg-background",
    decorators: null
  },
  {
    className: "relative border-r border-b bg-secondary md:border-b-0 md:bg-background dark:bg-secondary/30 md:dark:bg-background",
    decorators: (
      <Plus
        className="-right-[12.5px] -bottom-[12.5px] md:-left-[12.5px] absolute z-10 size-6 md:hidden text-muted-foreground/50"
        strokeWidth={1}
      />
    )
  },
  {
    className: "border-b bg-background md:border-r md:border-b-0 md:bg-secondary dark:md:bg-secondary/30",
    decorators: null
  },
  {
    className: "border-r border-b md:border-b-0",
    decorators: null
  },
  {
    className: "bg-secondary dark:bg-secondary/30 border-b md:border-b-0",
    decorators: null
  }
]

type TechStackCloudProps = React.ComponentProps<'div'>

export function TechStackCloud({ className, ...props }: TechStackCloudProps) {
  return (
    <div
      className={cn(
        'relative grid grid-cols-2 border-x md:grid-cols-4',
        className
      )}
      {...props}
    >
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t" />

      {LOGOS.map(function (logo, i) {
        // Fallback to a basic style if we run out of defined styles
        const style = CARD_STYLES[i] || { className: "border-r border-b", decorators: null }
        return (
          <TechCard
            key={logo.name}
            logo={logo}
            className={style.className}
          >
            {style.decorators}
          </TechCard>
        )
      })}

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b" />
    </div>
  )
}

type TechCardProps = React.ComponentProps<'div'> & {
  logo: TechItem
}

function TechCard({
  logo,
  className,
  children,
  ...props
}: TechCardProps) {
  const [showLabel, setShowLabel] = useState(false)
  const Icon = logo.Icon

  const handleToggle = () => {
    setShowLabel(prev => !prev)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background px-4 py-8 md:p-8 relative overflow-hidden group min-h-[120px]',
        className
      )}
      {...props}
    >
      <div className="relative flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-label={`${logo.label}${showLabel ? ' - tap to hide name' : ' - tap to show name'}`}
          aria-pressed={showLabel}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm p-1 -m-1"
        >
          <Icon
            className="w-8 h-8 md:w-10 md:h-10 text-foreground/60 group-hover:text-foreground transition-colors duration-200"
          />
        </button>

        <div
          className={cn(
            "text-[10px] font-medium text-muted-foreground whitespace-nowrap absolute -bottom-6 w-full text-center transition-all duration-200 ease-out",
            showLabel ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          )}
        >
          {logo.label}
        </div>
      </div>

      {children}
    </div>
  )
}
