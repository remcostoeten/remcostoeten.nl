'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import { PeekFrame } from './peek-frame'

type Props = {
	poster?: string
	src: string
	href: string
	title: string
}

function getHost(href: string) {
	try {
		return new URL(href).host
	} catch {
		return href
	}
}

export function LivePreview({ poster, src, href, title }: Props) {
	const [isMounted, setIsMounted] = useState(!poster)
	const [isLoaded, setIsLoaded] = useState(false)

	function mountLive() {
		setIsMounted(true)
	}

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`Open ${title}`}
			onPointerEnter={mountLive}
			onFocus={mountLive}
			className="absolute inset-0 block focus-visible:outline-none"
		>
			<PeekFrame label={getHost(href)} align="center" isLive>
				{poster && (
					<Image
						src={poster}
						alt=""
						fill
						sizes="(min-width: 640px) 420px, 100vw"
						className="object-cover object-left-top"
					/>
				)}
				{isMounted && (
					<iframe
						src={src}
						title={`${title} preview`}
						loading="lazy"
						tabIndex={-1}
						aria-hidden="true"
						sandbox="allow-scripts allow-same-origin"
						onLoad={() => setIsLoaded(true)}
						className={cn(
							'pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-25 border-0 transition-opacity duration-300 ease-out',
							isLoaded ? 'opacity-100' : 'opacity-0'
						)}
					/>
				)}
			</PeekFrame>
		</a>
	)
}
