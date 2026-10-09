'use client'

import { useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'
import {
	SiApple,
	SiDiscord,
	SiGithub,
	SiGoogle,
	SiTiktok
} from 'react-icons/si'
import { useInViewOnce } from '@/hooks/use-in-view-once'
import { cn } from '@/shared/lib/cn'

const providers = [
	{ label: 'GitHub', icon: SiGithub },
	{ label: 'Google', icon: SiGoogle }
]

const socialIcons = [SiApple, SiDiscord, SiTiktok]

export function AuthDrawerPreview() {
	const ref = useRef<HTMLDivElement>(null)
	const isInView = useInViewOnce(ref, '0px 0px -20% 0px')

	return (
		<div ref={ref} className="absolute inset-0 overflow-hidden">
			<div
				aria-hidden="true"
				className={cn(
					'pointer-events-none absolute inset-x-[6%] top-[10%] flex select-none flex-col items-center border-x border-t border-border/50 bg-background-secondary px-[9%] pb-6 pt-2.5 transition-[translate] duration-500 ease-drawer motion-reduce:transition-[opacity] motion-reduce:duration-200 motion-reduce:ease-[ease]',
					isInView
						? 'translate-y-0 opacity-100'
						: 'translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0'
				)}
			>
				<span className="h-[3px] w-7 bg-muted" />
				<X className="absolute right-3 top-2.5 size-3 text-muted-foreground/70" />
				<p className="mt-3.5 text-[15px] font-medium tracking-tight text-foreground">
					Welcome back
				</p>
				<p className="mt-1 max-w-[36ch] text-center text-[9px] leading-snug text-muted-foreground">
					Sign in to sync your notes anywhere while keeping
					local-first saves intact
				</p>
				<div className="mt-3.5 grid w-full gap-1.5">
					{providers.map(provider => (
						<span
							key={provider.label}
							className="flex h-7 items-center justify-center gap-1.5 border border-border bg-background text-[10px] font-medium text-foreground"
						>
							<provider.icon className="size-3 text-muted-foreground" />
							Continue with {provider.label}
						</span>
					))}
				</div>
				<div className="mt-2.5 flex items-center gap-1">
					{socialIcons.map((Icon, index) => (
						<span
							key={index}
							className="flex size-5 items-center justify-center border border-border bg-background text-muted-foreground"
						>
							<Icon className="size-2.5" />
						</span>
					))}
					<span className="ml-1.5 flex items-center gap-0.5 text-[8px] text-muted-foreground">
						Show all social methods
						<ChevronDown className="size-2.5" />
					</span>
				</div>
				<div className="mt-3 flex w-full items-center gap-2">
					<span className="h-px flex-1 bg-border" />
					<span className="font-mono text-[7px] uppercase tracking-[0.14em] text-muted-foreground/70">
						Or continue with email
					</span>
					<span className="h-px flex-1 bg-border" />
				</div>
				<span className="mt-2.5 flex h-7 w-full items-center border border-border bg-background px-2 font-mono text-[10px] text-muted-foreground">
					demo@remcostoeten.nl
				</span>
			</div>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card from-15% to-transparent" />
		</div>
	)
}
