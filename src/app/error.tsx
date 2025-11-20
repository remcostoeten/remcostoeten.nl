'use client'

import { useEffect } from 'react'
import Link from 'next/link'

type props ={
    error: Error & { digest?: string }
    reset: () => void
    }

export default function Error({ error, reset }: props) {
    useEffect(() => {
        console.error('Application error:', error)
    }, [error])

    return (
        <section>
            <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
                Something went wrong!
            </h1>
            <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                {error.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4">
                <button
                    onClick={reset}
                    className="text-neutral-800 dark:text-neutral-200 underline underline-offset-2"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="text-neutral-800 dark:text-neutral-200 underline underline-offset-2"
                >
                    Return to home
                </Link>
            </div>
        </section>
    )
}

