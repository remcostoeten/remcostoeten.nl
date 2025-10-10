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
    const [isRolling, setIsRolling] = useState<boolean>(false)

    const canAnimate = useCanAnimate({ respectMotionPreference })
    const prefersReducedMotion = usePrefersReducedMotion()

    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false)
            if (randomStart) {
                const randomValue = Math.max(1, Math.floor(Math.random() * randomRange) + 1)
                setDisplayValue(randomValue)
            } else {
                setDisplayValue(value)
            }
        }
    }, [value, randomStart, randomRange, isInitialLoad])

    useEffect(() => {
        if (shouldAnimate && randomStart && !isInitialLoad) {
            setIsRolling(true)
            
            const rollingInterval = setInterval(() => {
                const randomValue = Math.max(1, Math.floor(Math.random() * randomRange) + 1)
                setDisplayValue(randomValue)
            }, 100)
            
            const stopRollingTimer = setTimeout(() => {
                clearInterval(rollingInterval)
                setIsRolling(false)
                setDisplayValue(value)
            }, delay + 1000)

            return () => {
                clearInterval(rollingInterval)
                clearTimeout(stopRollingTimer)
            }
        } else if (shouldAnimate && !randomStart) {
            setDisplayValue(value)
        }
    }, [shouldAnimate, value, delay, randomStart, isInitialLoad, randomRange])

    // If motion is disabled or reduced motion is preferred, show static value
    if (!canAnimate || prefersReducedMotion) {
        const formattedValue = value.toLocaleString(locale, FORMAT_CONFIG[format](decimals, useGrouping))
        return (
            <span className={cn("inline-block", className)} style={{ minWidth: `${formattedValue.length}ch` }}>
                {prefix}
                {formattedValue}
                {suffix}
            </span>
        )
    }

    const finalFormattedValue = value.toLocaleString(locale, FORMAT_CONFIG[format](decimals, useGrouping))
    
    return (
        <span className={cn("inline-block", className)} style={{ minWidth: `${finalFormattedValue.length}ch` }}>
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
