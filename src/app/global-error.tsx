'use client'

export default function GlobalError({
	error,
	reset
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<html lang="en">
			<body>
				<div style={{ padding: '2rem', textAlign: 'center' }}>
					<h2>Something went wrong!</h2>
					<p>{error.message}</p>
					<button
						onClick={() => reset()}
						style={{
							padding: '0.5rem 1rem',
							marginTop: '1rem',
							background: '#000',
							color: '#fff',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
