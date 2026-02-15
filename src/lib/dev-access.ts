import { NextResponse } from 'next/server'
import { isAdmin } from '@/utils/is-admin'

export async function canAccessDevTools(): Promise<boolean> {
	if (process.env.NODE_ENV === 'development') {
		return true
	}

	return isAdmin()
}

export async function requireDevToolsAccess() {
	const allowed = await canAccessDevTools()
	if (allowed) {
		return null
	}

	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
