"use client"

import { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"
import { useCanAnimate, usePrefersReducedMotion } from "@number-flow/react"
import { cn } from "@/shared/utilities"

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
    animateDigitsSeparately?: boolean
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
    duration = 1500,
    animateDigitsSeparately = false
}: TProps) {
    const [displayValue, setDisplayValue] = useState<number>(value)
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
    const [digitValues, setDigitValues] = useState<number[]>([])
    const [hasAnimated, setHasAnimated] = useState<boolean>(false)

    const canAnimate = useCanAnimate({ respectMotionPreference })
    const prefersReducedMotion = usePrefersReducedMotion()

    const valueDigits = String(value).split('').map(Number)

    useEffect(() => {
        if (animateDigitsSeparately && isInitialLoad) {
            setIsInitialLoad(false)
            const initialDigits = valueDigits.map(() => Math.floor(Math.random() * 10))
            setDigitValues(initialDigits)
        } else if (isInitialLoad) {
            setIsInitialLoad(false)
            if (randomStart) {
                const randomValue = Math.floor(Math.random() * 10)
                setDisplayValue(randomValue)
            } else {
                setDisplayValue(value)
            }
        }
    }, [value, randomStart, randomRange, isInitialLoad, animateDigitsSeparately, valueDigits])

    useEffect(() => {
        if (hasAnimated) return

        if (animateDigitsSeparately && shouldAnimate && !isInitialLoad) {
            const rollingInterval = setInterval(() => {
                const newDigits = valueDigits.map(() => Math.floor(Math.random() * 10))
                setDigitValues(newDigits)
            }, 80)

            const stopRollingTimer = setTimeout(() => {
                clearInterval(rollingInterval)
                setDigitValues(valueDigits)
                setHasAnimated(true)
            }, delay + 800)

            return () => {
                clearInterval(rollingInterval)
                clearTimeout(stopRollingTimer)
            }
        } else if (shouldAnimate && randomStart && !isInitialLoad) {
            const rollingInterval = setInterval(() => {
                const randomValue = Math.floor(Math.random() * 10)
                setDisplayValue(randomValue)
            }, 80)

            const stopRollingTimer = setTimeout(() => {
                clearInterval(rollingInterval)
                setDisplayValue(value)
                setHasAnimated(true)
            }, delay + 600)

            return () => {
                clearInterval(rollingInterval)
                clearTimeout(stopRollingTimer)
            }
        } else if (shouldAnimate && !randomStart) {
            setDisplayValue(value)
            setHasAnimated(true)
        }
    }, [shouldAnimate, value, delay, randomStart, isInitialLoad, randomRange, animateDigitsSeparately, valueDigits, hasAnimated])

    // If motion is disabled or reduced motion is preferred, show static value
    if (!canAnimate || prefersReducedMotion) {
        const formattedValue = value.toLocaleString(locale, FORMAT_CONFIG[format](decimals, useGrouping))
        const fullContent = prefix + formattedValue + suffix
        return (
            <span className={cn("inline-block tabular-nums", className)} style={{ minWidth: `${fullContent.length}ch` }}>
                {prefix}
                {formattedValue}
                {suffix}
            </span>
        )
    }

    if (animateDigitsSeparately) {
        const displayDigits = digitValues.length > 0 ? digitValues : valueDigits
        const fullContent = prefix + String(value) + suffix

        return (
            <span className={cn("inline-flex tabular-nums", className)} style={{ minWidth: `${fullContent.length}ch` }}>
                {prefix}
                {displayDigits.map((digit, index) => (
                    <NumberFlow
                        key={index}
                        value={digit}
                        format={{ useGrouping: false }}
                        locales={locale}
                        duration={duration}
                    />
                ))}
                {suffix}
            </span>
        )
    }

    const finalFormattedValue = value.toLocaleString(locale, FORMAT_CONFIG[format](decimals, useGrouping))
    const formattedPrefix = prefix + finalFormattedValue + suffix
    const minWidth = formattedPrefix.length

    return (
        <span className={cn("inline-block tabular-nums", className)} style={{ minWidth: `${minWidth}ch` }}>
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