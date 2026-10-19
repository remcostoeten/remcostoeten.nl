'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useSession, type SessionUser } from './client'
import { useSessionHint } from './session-hint'

type SessionState = {
	user: SessionUser | null
	isPending: boolean
}

type Props = {
	children: (session: SessionState) => ReactNode
}

type ReaderProps = {
	onChange: (session: SessionState) => void
}

const ANONYMOUS: SessionState = { user: null, isPending: false }
const PENDING: SessionState = { user: null, isPending: true }

function SessionReader({ onChange }: ReaderProps) {
	const { data, isPending } = useSession()
	const user = data?.user ?? null

	useEffect(() => {
		onChange({ user, isPending })
	}, [user, isPending, onChange])

	return null
}

/**
 * @name OptionalSession
 * @description Hands the current session to its render prop, but only asks the
 * server for it when this browser has signed in before. Visitors without the
 * session hint render as anonymous and trigger no session request.
 *
 * @example
 * <OptionalSession>
 *   {({ user }) => (user ? <Dashboard user={user} /> : <SignIn />)}
 * </OptionalSession>
 */
export function OptionalSession({ children }: Props) {
	const mayHaveSession = useSessionHint()
	const [session, setSession] = useState<SessionState>(PENDING)

	return (
		<>
			{mayHaveSession && <SessionReader onChange={setSession} />}
			{children(mayHaveSession ? session : ANONYMOUS)}
		</>
	)
}
