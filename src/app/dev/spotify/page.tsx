'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'


function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-neutral-900 border-neutral-800">
            {children}
        </div>
    )
}

function CardHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-sm text-neutral-400">
            {children}
        </div>
    )
}

function CardContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-4">
            {children}
        </div>
    )
}

type Props = {
    before: string
    after: string
}

function Compare(props: Props) {
    const [open, setOpen] = useState(false)

    function toggle() {
        setOpen(!open)
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Card>
                <CardHeader>
                    Modern JavaScript™
                </CardHeader>
                <CardContent>
                    <pre className="overflow-x-auto rounded-md bg-neutral-950 p-4 text-sm text-neutral-200">
                        {props.before}
                    </pre>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <button
                    onClick={toggle}
                    className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                >
                    reveal secret
                </button>
            </div>

            {open ? (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <Card   >
                        <CardHeader>
                            Ancient Forbidden Knowledge
                        </CardHeader>
                        <CardContent>
                            <pre className="overflow-x-auto rounded-md bg-neutral-950 p-4 text-sm text-neutral-200">
                                {props.after}
                            </pre>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : null}
        </div>
    )
}

export default function Page() {
    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-20 text-neutral-200">
            <h1 className="mb-10 text-center text-3xl font-semibold">
                Just use functions
            </h1>

            <Compare
                before={`const buildUser = (name, age) => {
  const clean = name.trim()
  const safeAge = Math.max(age, 0)
  const active = safeAge > 0
  return { name: clean, age: safeAge, active }
}`}
                after={`function buildUser(name, age) {
  const clean = name.trim()
  const safeAge = Math.max(age, 0)
  const active = safeAge > 0
  return { name: clean, age: safeAge, active }
}`}
            />
        </main>
    )
}
