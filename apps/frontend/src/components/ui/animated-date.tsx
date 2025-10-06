"use client"

import { useEffect, useState, useRef } from "react"
import { AnimatedNumber } from "./animated-number"
import { cn } from "@/lib/utils"

interface TProps {
    date: string
    className?: string
    threshold?: number
    rootMargin?: string
    delay?: number
}

export function AnimatedDate({
    date,
    className,
    threshold = 0.1,
    rootMargin = "0px",
    delay = 0
}: TProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)
    const elementRef = useRef<HTMLTimeElement>(null)

    const parsedDate = new Date(date)
    const month = parsedDate.toLocaleDateString('en-US', { month: 'short' })
    const day = parsedDate.getDate()
    const year = parsedDate.getFullYear()

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        // Add a small delay to ensure the element is fully visible
                        setTimeout(() => {
                            setIsVisible(true)
                            setHasAnimated(true)
                        }, 200)
                    }
                })
            },
            {
                threshold,
                rootMargin
            }
        )

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [threshold, rootMargin, hasAnimated])

    return (
        <time
            ref={elementRef}
            dateTime={date}
            className={cn("inline-block", className)}
        >
            {isVisible ? (
                <>
                    {month} <AnimatedNumber value={day} delay={delay} randomStart={true} randomRange={9} />, <AnimatedNumber value={year} delay={delay + 200} randomStart={true} randomRange={9} />
                </>
            ) : (
                <span>{month} 0, 0</span>
            )}
        </time>
    )
}
