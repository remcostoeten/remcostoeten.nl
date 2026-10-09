import Image from 'next/image'
import Link from 'next/link'
import { isAdmin } from '@/features/auth/guard'
import { Fragment } from 'react'
import { AvatarOrbit } from './avatar-orbit'
import { getIntro, type IntroContent } from './intro-queries'

function renderBio(bio: string) {
	return bio.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
		if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
			return <strong key={index}>{part.slice(2, -2)}</strong>
		if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
			return <em key={index}>{part.slice(1, -1)}</em>
		return <Fragment key={index}>{part}</Fragment>
	})
}

export function IntroView({
	intro,
	canEdit = false
}: {
	intro: IntroContent
	canEdit?: boolean
}) {
	return (
		<header className="px-4 md:px-5">
			<div className="flex items-start gap-4 mb-4">
				<div suppressHydrationWarning className="relative shrink-0">
					<Image
						src="/images/remco-stoeten.webp"
						alt="Remco Stoeten - Frontend Engineer"
						width={224}
						height={224}
						sizes="56px"
						priority
						quality={85}
						className="w-14 h-14 rounded-full border-2 border-border/50 shadow-sm"
					/>
					<AvatarOrbit />
				</div>
				<div className="min-w-0">
					<h1 className="text-xl font-semibold tracking-tight text-foreground">
						{intro.name}
					</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						{intro.role}
					</p>
				</div>
				{canEdit && (
					<Link
						href="/admin/intro"
						className="ml-auto text-xs text-muted-foreground hover:text-foreground"
					>
						Edit intro
					</Link>
				)}
			</div>

			{/*
			 * If you for some reason read this part
			 * Then let's just act as if you never saw this
			 * I'm sorry for the trauma.
			 */}

			<div className="max-w-none">
				<p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
					{renderBio(intro.bio)}
				</p>
			</div>
		</header>
	)
}

export async function Intro() {
	const [intro, canEdit] = await Promise.all([getIntro(), isAdmin()])
	return <IntroView intro={intro} canEdit={canEdit} />
}
