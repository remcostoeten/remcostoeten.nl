'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Something went wrong!</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '8px'
          }}
        >
          Try again
        </button>
        <a 
          href="/"
          style={{
            color: '#0070f3',
            textDecoration: 'none',
            padding: '12px 24px',
            display: 'inline-block'
          }}
        >
          Return home
        </a>
      </div>
    </div>
  )
}