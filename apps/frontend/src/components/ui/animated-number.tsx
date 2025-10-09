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
    useGrouping?: boolean
    shouldAnimate?: boolean
    duration?: number
}

const FORMAT_CONFIG = {
    currency: (decimals: number, useGrouping: boolean = true) => ({ style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping }),
    percentage: (decimals: number, useGrouping: boolean = true) => ({ style: "percent", minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping }),
    decimal: (decimals: number, useGrouping: boolean = true) => ({ minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping }),
    number: (decimals: number, useGrouping: boolean = true) => ({ minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping })
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
    delay = 0,
    useGrouping = true,
    shouldAnimate = true,
    duration = 1500
}: TProps) {
    const [displayValue, setDisplayValue] = useState<number>(value)
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

    const canAnimate = useCanAnimate({ respectMotionPreference })
    const prefersReducedMotion = usePrefersReducedMotion()

    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false)
            if (randomStart) {
                // Always start with random value for dramatic effect when randomStart is true
                const randomValue = Math.max(0, Math.floor(Math.random() * randomRange))
                setDisplayValue(randomValue)
            } else {
                // If not random start, set to actual value immediately
                setDisplayValue(value)
            }
        }
    }, [value, randomStart, randomRange, isInitialLoad])

    // Separate effect to handle animation trigger
    useEffect(() => {
        if (shouldAnimate && randomStart && !isInitialLoad) {
            // Animate to actual value after delay when shouldAnimate becomes true
            const timer = setTimeout(() => {
                setDisplayValue(value)
            }, delay)

            return () => clearTimeout(timer)
        } else if (shouldAnimate && !randomStart) {
            // Direct animation without random start
            setDisplayValue(value)
        }
    }, [shouldAnimate, value, delay, randomStart, isInitialLoad])

    // If motion is disabled or reduced motion is preferred, show static value
    if (!canAnimate || prefersReducedMotion) {
        return (
            <span className={className}>
                {prefix}
                {value.toLocaleString(locale, FORMAT_CONFIG[format](decimals, useGrouping))}
                {suffix}
            </span>
        )
    }

    return (
        <span className={className}>
            {prefix}
            <NumberFlow
                value={displayValue}
                format={FORMAT_CONFIG[format](decimals, useGrouping)}
                locales={locale}
                suffix={suffix}
                duration={duration}
            />
        </span>
    )
}
