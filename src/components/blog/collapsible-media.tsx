'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface CollapsibleMediaProps {
    src: string
    title?: string
    width?: number
    height?: number
    alt?: string
}

export function CollapsibleMedia({
    src,
    title = 'Click to view media',
    width = 800,
    height = 600,
    alt = 'Collapsible media'
}: CollapsibleMediaProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    return (
        <div className="my-8 border border-zinc-800 rounded-none AAAA overflow-hidden bg-zinc-900/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">
                        {title}
                    </span>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 border-t border-zinc-800/50">
                            <div className={`
                                relative rounded-none AAAA overflow-hidden bg-zinc-950
                                ${!isLoaded ? 'min-h-[200px] animate-pulse' : ''}
                            `}>
                                <Image
                                    src={src}
                                    alt={alt}
                                    width={width}
                                    height={height}
                                    className={`
                                        w-full h-auto rounded-none AAAA transition-opacity duration-500
                                        ${isLoaded ? 'opacity-100' : 'opacity-0'}
                                    `}
                                    onLoadingComplete={() => setIsLoaded(true)}
                                />
                                {!isLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                                        Loading media...
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
