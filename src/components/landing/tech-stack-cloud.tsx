'use client'

import { useState, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Icons } from '@/components/brand-icons'
import { Plus } from 'lucide-react'

type Logo = {
  name: keyof typeof Icons
  label: string
}

const LOGOS: Logo[] = [
  { name: 'react', label: 'React' },
  { name: 'typescript', label: 'TypeScript' },
  { name: 'next', label: 'Next.js' },
  { name: 'bash', label: 'Shell' },
  { name: 'node', label: 'Node.js' },
  { name: 'postgres', label: 'PostgreSQL' },
  { name: 'docker', label: 'Docker' },
  { name: 'javascript', label: 'JavaScript' }
]

const CARD_STYLES = [
  {
    className: "relative border-r border-b bg-secondary dark:bg-secondary/30",
    decorators: (
      <Plus
        className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6"
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
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6"
          strokeWidth={1}
        />
        <Plus
          className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden size-6 md:block"
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
        className="-right-[12.5px] -bottom-[12.5px] md:-left-[12.5px] absolute z-10 size-6 md:hidden"
        strokeWidth={1}
      />
    )
  },
  {
    className: "border-b bg-background md:border-r md:border-b-0 md:bg-secondary dark:md:bg-secondary/30",
    decorators: null
  },
  {
    className: "border-r",
    decorators: null
  },
  {
    className: "bg-secondary dark:bg-secondary/30",
    decorators: null
  }
]

type TechStackCloudProps = React.ComponentProps<'div'>

export function TechStackCloud({ className, ...props }: TechStackCloudProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const delays = useMemo(function () {
    return LOGOS.map(function () {
      return Math.random() * 0.6
    })
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'relative grid grid-cols-2 border-x md:grid-cols-4',
        className
      )}
      {...props}
    >
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t" />

      {LOGOS.map(function (logo, i) {
        const style = CARD_STYLES[i] || {}
        return (
          <TechCard
            key={logo.name}
            icon={logo.name}
            label={logo.label}
            delay={delays[i]}
            isInView={isInView}
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
  icon: keyof typeof Icons
  label: string
  isInView: boolean
  delay: number
}

function TechCard({
  icon,
  label,
  isInView,
  delay,
  className,
  children,
  ...props
}: TechCardProps) {
  const [showLabel, setShowLabel] = useState(false)
  const [showLabel, setShowLabel] = useState(false)

  const Icon = Icons[icon]

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
        'flex items-center justify-center bg-background px-4 py-8 md:p-8 relative overflow-hidden group',
        className
      )}
      {...props}
    >
      <motion.div
       <motion.div
         className="relative flex flex-col items-center gap-2"
         initial={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
        animate={
          isInView
            ? {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)'
            }
            : {}
        }
        transition={{
          duration: 0.4,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-label={`${label}${showLabel ? ' - tap to hide name' : ' - tap to show name'}`}
          aria-pressed={showLabel}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm p-1 -m-1"
        >
          <Icon
            theme="dark"
            title={label}
            className="pointer-events-none h-4 select-none md:h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
          />
        </button>

        <AnimatePresence>
          {showLabel && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-medium text-muted-foreground whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {children}
    </div>
  )
}
