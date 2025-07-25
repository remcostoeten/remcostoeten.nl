import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db/connection';
import { analyticsEvents } from '../../../../db/schema';
import type { AnalyticsEvent } from '../../../../modules/analytics/types';

export async function POST(request: NextRequest) {
  try {
    const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = await request.json();
    
    // Get client IP and user agent from request
    const clientIP = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || '';

    await db.insert(analyticsEvents).values({
      eventType: event.eventType,
      page: event.page,
      referrer: event.referrer,
      userAgent: userAgent,
      ipAddress: clientIP,
      sessionId: event.sessionId,
      data: event.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
