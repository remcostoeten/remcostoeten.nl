import { NextResponse } from 'next/server'
import { listProviders, type ProviderKey } from '@/server/auth'

type ProviderResponse = {
	providers: ProviderKey[]
}

export function GET() {
	const providers = listProviders()
	console.log('[Auth API] GET /api/auth/providers returned:', providers)
	const body: ProviderResponse = { providers }
	return NextResponse.json(body)
}
