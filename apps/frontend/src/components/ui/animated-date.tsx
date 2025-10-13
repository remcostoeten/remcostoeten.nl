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
    rootMargin = "100px",
    delay = 0
}: TProps) {
    const [shouldAnimate, setShouldAnimate] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)
    const elementRef = useRef<HTMLTimeElement>(null)

    const parsedDate = new Date(date)

    // Validate the date
    if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid date in AnimatedDate component: ${date}`)
        // Fallback to showing the original date string
        return (
            <time ref={elementRef} dateTime={date} className={cn("inline-block", className)}>
                {date}
            </time>
        )
    }

    const month = parsedDate.toLocaleDateString('nl-NL', { month: 'short' })
    const day = parsedDate.getDate()
    const year = parsedDate.getFullYear()

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        // Trigger animation immediately when in view
                        setShouldAnimate(true)
                        setHasAnimated(true)
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
            className={cn("inline-block tabular-nums", className)}
            style={{ minWidth: `${String(day).length + 1 + String(month).length + 1 + 4}ch` }}
        >
            <AnimatedNumber
                value={day}
                delay={delay}
                randomStart={true}
                useGrouping={false}
                shouldAnimate={shouldAnimate}
                duration={600}
            /> {month} <AnimatedNumber
                value={year}
                delay={delay + 150}
                randomStart={true}
                useGrouping={false}
                shouldAnimate={shouldAnimate}
                duration={800}
            />
        </time>
    )
}
