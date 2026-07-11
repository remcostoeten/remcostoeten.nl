'use client'

import { useCurrentYear } from '@/hooks/use-current-year'

type Props = {
	className?: string
}

export function CurrentYear({ className }: Props) {
	const year = useCurrentYear()

	return (
		<time dateTime={`${year}`} className={className}>
			{year}
		</time>
	)
}
