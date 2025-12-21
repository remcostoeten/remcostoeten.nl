'use client'

import { useState, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Icons } from '@/components/brand-icons'

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
        return (
          <TechCard
            key={logo.name}
            icon={logo.name}
            label={logo.label}
            delay={delays[i]}
            isInView={isInView}
            className="border-r border-b bg-background dark:bg-background/20"
          />
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
  const [hover, setHover] = useState(false)

  const Icon = Icons[icon]

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background px-4 py-8 md:p-8 relative overflow-hidden group',
        className
      )}
      onMouseEnter={function () {
        setHover(true)
      }}
      onMouseLeave={function () {
        setHover(false)
      }}
      {...props}
    >
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
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
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <Icon
          theme="dark"
          title={label}
          className="pointer-events-none h-4 select-none md:h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
        />

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20"
            >
              <div className="px-2 py-1 rounded bg-foreground text-background text-[10px] font-medium whitespace-nowrap shadow-lg">
                {label}
              </div>

              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {children}
    </div>
  )
}
