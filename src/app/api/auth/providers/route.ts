import { NextResponse } from 'next/server'
import { listProviders, type ProviderKey } from '@/server/auth'

type ProviderResponse = {
	providers: ProviderKey[]
}

export function GET() {
	const providers = listProviders()
	const body: ProviderResponse = { providers }
	return NextResponse.json(body)
}
