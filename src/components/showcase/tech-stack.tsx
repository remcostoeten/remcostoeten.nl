import type { IconType } from 'react-icons'
import {
	SiExpo,
	SiFramer,
	SiGnubash,
	SiGo,
	SiGooglechrome,
	SiJsonwebtokens,
	SiNextdotjs,
	SiPostgresql,
	SiPython,
	SiReact,
	SiRust,
	SiTauri,
	SiTypescript,
	SiWebassembly,
	SiZig
} from 'react-icons/si'
import { cn } from '@/shared/lib/cn'
import { ElysiaIcon } from './elysia-icon'

type TechIcon = {
	icon: IconType
	color: string
}

const techIcons: Record<string, TechIcon> = {
	tauri: { icon: SiTauri, color: '#FFC131' },
	rust: { icon: SiRust, color: '#F74C00' },
	react: { icon: SiReact, color: '#61DAFB' },
	golang: { icon: SiGo, color: '#00ADD8' },
	go: { icon: SiGo, color: '#00ADD8' },
	'next.js': { icon: SiNextdotjs, color: 'currentColor' },
	typescript: { icon: SiTypescript, color: '#3178C6' },
	postgresql: { icon: SiPostgresql, color: '#4169E1' },
	'framer motion': { icon: SiFramer, color: 'currentColor' },
	python: { icon: SiPython, color: '#3776AB' },
	zig: { icon: SiZig, color: '#F7A41D' },
	bash: { icon: SiGnubash, color: 'currentColor' },
	jwt: { icon: SiJsonwebtokens, color: 'currentColor' },
	'chrome extension': { icon: SiGooglechrome, color: '#4285F4' },
	webassembly: { icon: SiWebassembly, color: '#654FF0' },
	wasm: { icon: SiWebassembly, color: '#654FF0' },
	expo: { icon: SiExpo, color: 'currentColor' },
	elysia: { icon: ElysiaIcon, color: 'currentColor' }
}

type Props = {
	tech: string[]
	align?: 'start' | 'end'
	className?: string
}

const EXPAND =
	'duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none'

export function TechStack({ tech, align = 'start', className }: Props) {
	const isEnd = align === 'end'

	return (
		<ul
			className={cn('flex items-center -space-x-1.5', className)}
			aria-label="Tech stack"
		>
			{tech.map(name => {
				const match = techIcons[name.toLowerCase()]
				return (
					<li
						key={name}
						className={cn(
							'group/tech relative flex h-6 min-w-6 items-center justify-center rounded-full border border-border bg-background px-[5px] ring-2 ring-card hover:z-10',
							isEnd && match && 'flex-row-reverse'
						)}
					>
						{match ? (
							<match.icon
								className="size-3 shrink-0"
								style={{ color: match.color }}
								aria-hidden="true"
							/>
						) : (
							<span
								className="font-mono text-[9px] font-medium text-muted-foreground"
								aria-hidden="true"
							>
								{name.slice(0, 2)}
							</span>
						)}
						{!match && <span className="sr-only">{name}</span>}
						<span
							aria-hidden={!match}
							className={cn(
								'grid grid-cols-[0fr] transition-[grid-template-columns] group-hover/tech:grid-cols-[1fr]',
								EXPAND
							)}
						>
							<span className="min-w-0 overflow-hidden">
								<span
									className={cn(
										'block whitespace-nowrap font-mono leading-none text-muted-foreground opacity-0 transition-opacity group-hover/tech:opacity-100',
										EXPAND,
										match && 'text-[10px]',
										match &&
											(isEnd
												? 'pl-1 pr-1.5'
												: 'pl-1.5 pr-1'),
										!match && 'text-[9px] font-medium'
									)}
								>
									{match ? name : name.slice(2)}
								</span>
							</span>
						</span>
					</li>
				)
			})}
		</ul>
	)
}
