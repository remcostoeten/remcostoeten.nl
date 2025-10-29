"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface TProps {
    minutes: number
    className?: string
    threshold?: number
    rootMargin?: string
    delay?: number
}

export function AnimatedReadTime({
    minutes,
    className,
    threshold = 0.3,
    rootMargin = "25px",
    delay = 0
}: TProps) {
    const [currentValue, setCurrentValue] = useState(0)
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

    useEffect(() => {
        if (!isVisible) return

        // Animate from random start value to actual value
        const startValue = Math.max(0, minutes - Math.floor(Math.random() * 3) - 1)
        const duration = 1000
        const startTime = Date.now()

        const animate = () => {
            const now = Date.now()
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)

            const newValue = Math.floor(startValue + (minutes - startValue) * easeOutQuart)
            setCurrentValue(newValue)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setCurrentValue(minutes)
                setHasAnimated(true)
            }
        }

        // Start animation after delay
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(animate)
        }, delay)

        return () => clearTimeout(timeoutId)
    }, [isVisible, hasAnimated, minutes, delay])

    return (
        <span
            ref={elementRef}
            className={cn("inline-block tabular-nums font-medium", className)}
            style={{ minWidth: "3ch" }}
        >
            {isVisible ? (
                <span>{currentValue} min</span>
            ) : (
                <span className="opacity-40">-- min</span>
            )}
        </span>
    )
}