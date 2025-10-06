"use client"

import { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"
import { useCanAnimate, usePrefersReducedMotion } from "@number-flow/react"
import { cn } from "@/lib/utils"

type TAnimatedNumberFormat = "number" | "currency" | "percentage" | "decimal"

interface TProps {
    value: number
    prefix?: string
    suffix?: string
    format?: TAnimatedNumberFormat
    decimals?: number
    locale?: string
    className?: string
    respectMotionPreference?: boolean
    randomStart?: boolean
    randomRange?: number
    delay?: number
}

const FORMAT_CONFIG = {
    currency: (decimals: number) => ({ style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    percentage: (decimals: number) => ({ style: "percent", minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    decimal: (decimals: number) => ({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    number: (decimals: number) => ({ minimumFractionDigits: decimals, maximumFractionDigits: decimals })
} as const

export function AnimatedNumber({
    value,
    prefix = "",
    suffix = "",
    format = "number",
    decimals = 0,
    locale = "en-US",
    className,
    respectMotionPreference = true,
    randomStart = false,
    randomRange = 1000,
    delay = 0
}: TProps) {
    const [displayValue, setDisplayValue] = useState<number>(value)
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

    const canAnimate = useCanAnimate({ respectMotionPreference })
    const prefersReducedMotion = usePrefersReducedMotion()

    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false)
            if (randomStart) {
                // Start with random value for dramatic effect
                const randomValue = Math.max(0, Math.floor(Math.random() * randomRange))
                setDisplayValue(randomValue)

                // After delay, animate to actual value
                const timer = setTimeout(() => {
                    setDisplayValue(value)
                }, delay)

                return () => clearTimeout(timer)
            } else {
                // If not random start, set to actual value immediately
                setDisplayValue(value)
            }
        } else {
            // For subsequent updates, directly set the new value to trigger animation
            setDisplayValue(value)
        }
    }, [value, randomStart, randomRange, delay, isInitialLoad])

    // If motion is disabled or reduced motion is preferred, show static value
    if (!canAnimate || prefersReducedMotion) {
        return (
            <span className={className}>
                {prefix}
                {value.toLocaleString(locale, FORMAT_CONFIG[format](decimals))}
                {suffix}
            </span>
        )
    }

    return (
        <span className={className}>
            {prefix}
            <NumberFlow
                value={displayValue}
                format={FORMAT_CONFIG[format](decimals)}
                locales={locale}
                suffix={suffix}
                duration={1000}
            />
        </span>
    )
}
