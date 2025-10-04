"use client"

import { useState, useEffect } from "react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AnimatedNumberDemo() {
    const [counter, setCounter] = useState(42)
    const [price, setPrice] = useState(2999.99)
    const [percentage, setPercentage] = useState(0.85)
    const [stats, setStats] = useState({
        users: 15420,
        revenue: 45678.90,
        growth: 0.234
    })

    // Animate stats periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                users: prev.users + Math.floor(Math.random() * 100),
                revenue: prev.revenue + Math.floor(Math.random() * 1000),
                growth: Math.max(0, prev.growth + (Math.random() - 0.5) * 0.1)
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Animated Number Showcase</h2>
                <p className="text-muted-foreground">Click buttons to see animations in action</p>
            </div>

            {/* Basic Counter Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Basic Counter</CardTitle>
                    <CardDescription>Simple number animation with random start effect</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setCounter(prev => prev + 1)}
                            variant="outline"
                        >
                            Increment
                        </Button>
                        <div className="text-3xl font-bold text-accent">
                            <AnimatedNumber
                                value={counter}
                                randomStart={true}
                                randomRange={50}
                                delay={200}
                                className="tabular-nums"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Currency Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Currency Formatting</CardTitle>
                    <CardDescription>Price animation with currency formatting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setPrice(prev => prev + 100)}
                            variant="outline"
                        >
                            Add $100
                        </Button>
                        <div className="text-2xl font-semibold text-green-600">
                            <AnimatedNumber
                                value={price}
                                format="currency"
                                decimals={2}
                                locale="en-US"
                                className="tabular-nums"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Percentage Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Percentage Animation</CardTitle>
                    <CardDescription>Completion percentage with smooth transitions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setPercentage(prev => Math.min(1, prev + 0.05))}
                            variant="outline"
                        >
                            Increase Progress
                        </Button>
                        <div className="text-xl font-medium text-blue-600">
                            <AnimatedNumber
                                value={percentage}
                                format="percentage"
                                decimals={1}
                                className="tabular-nums"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Dashboard Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Live Stats Dashboard</CardTitle>
                    <CardDescription>Multiple metrics updating in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                <AnimatedNumber
                                    value={stats.users}
                                    className="tabular-nums"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                <AnimatedNumber
                                    value={stats.revenue}
                                    format="currency"
                                    decimals={0}
                                    prefix="$"
                                    className="tabular-nums"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                <AnimatedNumber
                                    value={stats.growth}
                                    format="percentage"
                                    decimals={1}
                                    className="tabular-nums"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">Growth Rate</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        Stats update automatically every 3 seconds
                    </p>
                </CardContent>
            </Card>

            {/* Accessibility Note */}
            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">!</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-800">Accessibility Note</p>
                            <p className="text-sm text-amber-700 mt-1">
                                All animations respect your motion preferences. If you have &ldquo;Reduce Motion&rdquo; enabled in your system settings, numbers will appear instantly without animation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
