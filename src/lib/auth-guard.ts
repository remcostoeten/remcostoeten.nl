import { headers } from 'next/headers'

const ADMIN_EMAILS = ['remcostoeten@hotmail.com', 'remcostoeten@gmail.com']
const ADMIN_GITHUB = 'remcostoeten'

export async function getSession() {
	try {
		const headersList = await headers()
		const cookie = headersList.get('cookie') ?? ''

		const res = await fetch(
			`${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL}/api/auth/get-session`,
			{
				headers: { cookie },
				cache: 'no-store'
			}
		)

		if (!res.ok) return null

		const data = await res.json()
		return data?.session ? data : null
	} catch {
		return null
	}
}

export async function isAdmin(): Promise<boolean> {
	const session = await getSession()
	if (!session?.user) return false

	const email = session.user.email?.toLowerCase()
	const name = session.user.name?.toLowerCase()

	const emailMatch = ADMIN_EMAILS.some(e => e.toLowerCase() === email)
	const githubMatch = name === ADMIN_GITHUB.toLowerCase()

	return emailMatch || githubMatch
}

export async function requireAdmin() {
	const admin = await isAdmin()
	if (!admin) {
		throw new Error('Unauthorized')
	}
	return true
}
