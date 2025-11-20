import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for could not be found.',
    robots: {
        index: false,
        follow: false
    }
}

export default function NotFound() {
    return (
        <section>
            <h1 className="mb-8 text-2xl font-semibold tracking-tighter">404 - Page Not Found</h1>
            <p className="mb-4">The page you are looking for does not exist or has been moved.</p>
            <Link
                href="/"
                className="text-neutral-800 dark:text-neutral-200 underline underline-offset-2"
            >
                Return to home
            </Link>
        </section>
    )
}
