'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Application Error</h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              A critical error occurred in the application.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#dc2626',
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
      </body>
    </html>
  )
}