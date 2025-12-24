import { NextResponse } from "next/server"
import { listProviders, type ProviderKey } from "@/server/auth"

type ProviderResponse = {
    providers: ProviderKey[]
}

export function GET() {
    const body: ProviderResponse = { providers: listProviders() }
    return NextResponse.json(body)
}
