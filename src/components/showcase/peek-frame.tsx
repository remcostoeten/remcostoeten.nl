import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Props = {
	label?: string
	align?: 'corner' | 'center'
	isLive?: boolean
	children: ReactNode
}

const wash = {
	backgroundImage:
		'linear-gradient(to bottom, hsl(var(--foreground) / 0.035), transparent 70%)'
}

const glow = {
	backgroundImage:
		'radial-gradient(50% 80% at 50% 0%, hsl(var(--foreground) / 0.06), transparent)'
}

export function PeekFrame({
	label,
	align = 'corner',
	isLive = false,
	children
}: Props) {
	return (
		<div className="absolute inset-0 overflow-hidden">
			<div className="absolute inset-0" style={wash} />
			<div className="absolute inset-x-0 top-0 h-2/3" style={glow} />
			<div
				className={cn(
					'absolute overflow-hidden rounded-t-lg border border-foreground/10 bg-background shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),0_24px_48px_-20px_rgb(0_0_0/0.8)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:group-hover:translate-0',
					align === 'corner' &&
						'left-[9%] top-[13%] w-[112%] group-hover:-translate-x-1 group-hover:-translate-y-1.5',
					align === 'center' &&
						'inset-x-[6%] top-[10%] group-hover:-translate-y-2'
				)}
			>
				{!isLive && label && (
					<div className="flex h-6 items-center border-b border-foreground/10 bg-card px-2.5">
						<span className="truncate font-mono text-[9px] tracking-wide text-muted-foreground">
							{label}
						</span>
					</div>
				)}
				<div className="relative aspect-[16/10]">
					{children}
					{isLive && (
						<span className="absolute right-2 top-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full border border-foreground/10 bg-background/80 py-1 pl-2 pr-1.5 font-mono text-[9px] tracking-wide text-muted-foreground backdrop-blur-sm transition-colors duration-200 ease-out group-hover:text-foreground motion-reduce:transition-none">
							<span className="relative flex size-1.5 shrink-0">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
								<span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
							</span>
							{label && <span className="truncate">{label}</span>}
							<ArrowUpRight
								className="size-3 shrink-0 transition-transform duration-300 ease-out group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transition-none"
								aria-hidden="true"
							/>
						</span>
					)}
				</div>
			</div>
		</div>
	)
}
