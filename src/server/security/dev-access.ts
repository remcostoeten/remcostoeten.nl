import { NextResponse } from 'next/server'

export async function canAccessDevTools(): Promise<boolean> {
	return process.env.NODE_ENV === 'development'
}

export async function requireDevToolsAccess() {
	const allowed = await canAccessDevTools()
	if (allowed) {
		return null
	}

	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
