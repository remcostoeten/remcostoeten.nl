// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404</h1>
        <p>Page not found</p>
        <a href="/">Return home</a>
      </div>
    </div>
  );
}
