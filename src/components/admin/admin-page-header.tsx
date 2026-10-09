import type { ReactNode } from 'react'

type Props = {
	title: string
	description: string
	actions?: ReactNode
}

export function AdminPageHeader({ title, description, actions }: Props) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="space-y-1.5">
				<h1 className="admin-display text-[28px] font-medium leading-tight">
					{title}
				</h1>
				<p className="max-w-xl text-[13px] text-muted-foreground">
					{description}
				</p>
			</div>
			{actions && (
				<div className="flex items-center gap-2">{actions}</div>
			)}
		</div>
	)
}
