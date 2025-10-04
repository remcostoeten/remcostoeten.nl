import { NextPageContext } from 'next'

interface ErrorProps {
  statusCode: number
  hasGetInitialPropsRun?: boolean
  err?: Error
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      background: '#000',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 600, 
          margin: '0 0 1rem 0' 
        }}>
          {statusCode}
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          margin: '0 0 2rem 0',
          color: '#888'
        }}>
          {statusCode === 404
            ? 'This page could not be found.'
            : statusCode === 500
            ? 'A server-side error occurred.'
            : 'An error occurred on client.'
          }
        </p>
        <a 
          href="/" 
          style={{
            color: '#0070f3',
            textDecoration: 'none',
            fontSize: '1rem',
            borderBottom: '1px solid #0070f3'
          }}
        >
          ← Go back home
        </a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404
  return { statusCode }
}

export default Error