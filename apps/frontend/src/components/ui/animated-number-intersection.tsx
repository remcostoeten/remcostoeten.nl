"use client"

import { useEffect, useState, useRef } from "react"
import { AnimatedNumber } from "./animated-number"
import { cn } from "@/lib/utils"

interface TProps {
    value: number
    prefix?: string
    suffix?: string
    className?: string
    threshold?: number
    rootMargin?: string
    delay?: number
}

export function AnimatedNumberIntersection({
    value,
    prefix = "",
    suffix = "",
    className,
    threshold = 0.5,
    rootMargin = "0px",
    delay = 0
}: TProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)
    const elementRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setIsVisible(true)
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
        <span ref={elementRef} className={cn("inline-block tabular-nums", className)} style={{ minWidth: `${String(prefix + value + suffix).length}ch` }}>
            {isVisible ? (
                <AnimatedNumber
                    value={value}
                    prefix={prefix}
                    suffix={suffix}
                    delay={delay}
                    randomStart={true}
                    duration={600}
                />
            ) : (
                <span>{prefix}0{suffix}</span>
            )}
        </span>
    )
}
