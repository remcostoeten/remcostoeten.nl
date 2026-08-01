import type { TToolSeoContent } from '../constants/tool-seo'

type Props = {
	name: string
	content: TToolSeoContent
}

export function ToolSeoContent({ name, content }: Props) {
	return (
		<section
			aria-labelledby="tool-guide-heading"
			className="mt-8 border-t border-border/50 pt-8"
		>
			<div className="max-w-3xl">
				<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
					Tool guide
				</p>
				<h2
					id="tool-guide-heading"
					className="mt-2 text-lg font-semibold text-foreground"
				>
					About {name}
				</h2>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					{content.intro}
				</p>
			</div>

			<div className="mt-6 grid gap-6 md:grid-cols-2">
				<div>
					<h3 className="text-sm font-medium text-foreground">
						What it does
					</h3>
					<ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
						{content.highlights.map(highlight => (
							<li key={highlight} className="flex gap-2">
								<span
									aria-hidden
									className="text-foreground/50"
								>
									—
								</span>
								<span>{highlight}</span>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="text-sm font-medium text-foreground">
						How to use it
					</h3>
					<ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
						{content.steps.map((step, index) => (
							<li key={step} className="flex gap-2">
								<span className="font-mono text-foreground/50">
									{index + 1}.
								</span>
								<span>{step}</span>
							</li>
						))}
					</ol>
				</div>
			</div>

			<div className="mt-6 border-y border-border/50 py-4">
				<h3 className="text-sm font-medium text-foreground">
					Supported formats
				</h3>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					{content.formats}
				</p>
			</div>
		</section>
	)
}
