import Image from 'next/image'

export function Intro() {
	return (
		<header className="px-4 md:px-5">
			<div className="flex items-start gap-4 mb-4">
				<Image
					src="/images/remco-stoeten.webp"
					alt="Remco Stoeten - Frontend Engineer"
					width={56}
					height={56}
					priority
					quality={85}
					className="w-14 h-14 rounded-full border-2 border-border/50 shadow-sm shrink-0"
				/>
				<div className="min-w-0">
					<h1 className="text-xl font-semibold tracking-tight text-foreground">
						Remco Stoeten
					</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						Frontend Engineer
					</p>
				</div>
			</div>

			{/*
			 * If you for some reason read this part
			 * Then let's just act as if you never saw this
			 * I'm sorry for the trauma.
			 */}

			<div className="prose prose-sm dark:prose-invert text-muted-foreground">
				<p>
					Dutch software engineer focused on front-end development
					with a degree in <em>graphic design</em>.{' '}
					<strong>8 years</strong> of experience across e-commerce,{' '}
					SaaS, government, and e-learning projects.
				</p>
			</div>
		</header>
	)
}
