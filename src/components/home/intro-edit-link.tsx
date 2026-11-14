'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSessionHint } from '@/features/auth/session-hint'
import { canEditIntro } from './intro-actions'

export function IntroEditLink() {
	const mayHaveSession = useSessionHint()
	const [canEdit, setCanEdit] = useState(false)

	useEffect(() => {
		if (!mayHaveSession) return

		let isCurrent = true
		canEditIntro().then(
			allowed => {
				if (isCurrent) setCanEdit(allowed)
			},
			() => {
				if (isCurrent) setCanEdit(false)
			}
		)

		return () => {
			isCurrent = false
		}
	}, [mayHaveSession])

	if (!mayHaveSession || !canEdit) return null

	return (
		<Link
			href="/admin/intro"
			className="ml-auto text-xs text-muted-foreground hover:text-foreground"
		>
			Edit intro
		</Link>
	)
}
