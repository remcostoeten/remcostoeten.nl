'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ProjectMedia } from '../types/project'

type Props = {
  media?: ProjectMedia
}

export function MediaFrame({ media }: Props) {
  if (!media) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
      className="overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-background to-background-secondary/40 shadow-lg"
    >
      <div className="relative aspect-video w-full">
        {media.kind === 'image' || media.kind === 'gif' ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster={media.poster}
          >
            <source src={media.src} />
          </video>
        )}
      </div>
    </motion.div>
  )
}
