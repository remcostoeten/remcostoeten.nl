import { NextRequest, NextResponse } from "next/server";

// No-op auth API handlers
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Auth API disabled' }, { status: 404 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Auth API disabled' }, { status: 404 });
}
