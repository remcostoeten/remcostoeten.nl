import type { ReactNode } from 'react'

type PageHeaderProps = {
	title: string
	subtitle?: string
	description?: string
	icon?: ReactNode
	className?: string
}

export function PageHeader({
	title,
	subtitle,
	description,
	icon,
	className
}: PageHeaderProps) {
	return (
		<div className={className}>
			<div className="flex items-center gap-3 mb-1">
				{icon}
				<h1 className="font-semibold text-xl sm:text-2xl md:text-3xl tracking-tight text-foreground">
					{title}
				</h1>
			</div>
			{subtitle && (
				<p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
			)}
			{description && (
				<p className="text-muted-foreground mt-2">{description}</p>
			)}
		</div>
	)
}
