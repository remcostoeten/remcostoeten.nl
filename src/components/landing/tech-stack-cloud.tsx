'use client'

import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import {
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiTailwindcss,
  SiDocker,
  SiGithubactions,
  SiBun,
  SiHono,
  SiTurso,
  SiSass,
  SiCss3,
} from 'react-icons/si'

type TechItem = {
  name: string
  label: string
  Icon: React.ComponentType<{ className?: string }> | React.ComponentType<{ className?: string }>[]
}

const LOGOS: TechItem[] = [
  { name: 'react', label: 'React', Icon: SiReact },
  { name: 'next', label: 'Next.js', Icon: SiNextdotjs },
  { name: 'typescript', label: 'TypeScript', Icon: SiTypescript },
  { name: 'bun', label: 'Bun', Icon: SiBun },
  { name: 'styling', label: 'CSS / Tailwind', Icon: [SiCss3, SiTailwindcss] },
  { name: 'node-hono', label: 'Node.js / Hono', Icon: [SiNodedotjs, SiHono] },
  { name: 'postgres-libsql', label: 'Postgres / LibSQL', Icon: [SiPostgresql, SiTurso] },
  { name: 'tools', label: 'Docker / CI/CD', Icon: [SiDocker, SiGithubactions] },
]

const CARD_STYLES = [
  {
    className: "relative border-r border-b bg-secondary dark:bg-secondary/30",
    decorators: (
      <Plus
        className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground/50"
        strokeWidth={1}
        aria-hidden="true"
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
          aria-hidden="true"
        />
        <Plus
          className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden size-6 md:block text-muted-foreground/50"
          strokeWidth={1}
          aria-hidden="true"
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
        aria-hidden="true"
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
  const Icons = Array.isArray(logo.Icon) ? logo.Icon : [logo.Icon]
  const containerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // We rotate by 180 degrees for each icon skip.
  const rawRotation = useTransform(
    scrollYProgress,
    [0, 1],
    [0, (Icons.length - 1) * 180]
  )

  // Force rotation to snap to 180 degree increments
  const steppedRotation = useTransform(rawRotation, (v) => Math.round(v / 180) * 180)

  const rotationX = useSpring(steppedRotation, { stiffness: 300, damping: 35 })

  useMotionValueEvent(rotationX, "change", (latest) => {
    // Snap to nearest icon index at the 90-degree points
    const newIndex = Math.floor((latest + 90) / 180) % Icons.length
    if (newIndex !== index) {
      setIndex(newIndex)
    }
  })

  const ActiveIcon = Icons[index]

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex items-center justify-center bg-background px-4 py-8 md:p-8 relative overflow-hidden group min-h-[120px]',
        className
      )}
      style={{ perspective: '1000px' }}
      {...props}
    >
      <div className="relative flex flex-col items-center gap-2 h-16 justify-end">
        <div className="rounded-sm p-1 -m-1 relative h-10 w-10 flex items-center justify-center mb-1">
          <motion.div
            style={{
              rotateX: rotationX,
              transformStyle: 'preserve-3d',
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <div
              className="w-full h-full relative"
              style={{
                backfaceVisibility: 'hidden',
                transform: index % 2 === 1 ? 'rotateX(180deg)' : 'none'
              }}
            >
              <ActiveIcon
                className="w-8 h-8 md:w-10 md:h-10 text-foreground/60 group-hover:text-foreground transition-colors duration-200"
              />
            </div>
          </motion.div>
        </div>

        <div className="text-[10px] font-medium text-muted-foreground whitespace-nowrap text-center h-4">
          {logo.label}
        </div>
      </div>

      {children}
    </div>
  )
}
