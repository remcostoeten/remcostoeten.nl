import Link from "next/link";

export function NotFoundView() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
				<p className="text-xl text-muted-foreground mb-4">
					Oops! Page not found
				</p>
				<Link href="/" className="text-accent hover:text-accent/80 underline">
					Return to Home
				</Link>
			</div>
		</div>
	);
}
