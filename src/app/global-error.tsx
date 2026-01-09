'use client'

import { useEffect } from 'react'

type GlobalErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('Global application error:', error)
    }, [error])

    return (
        <html>
            <body>
                <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Something went wrong!
                    </h1>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}

