import { db } from './src/db/connection.ts';
import { analyticsEvents } from './src/db/schema.ts';
import { sql, desc, count, eq } from 'drizzle-orm';

async function debugAnalytics() {
  try {
    console.log('🔍 Debugging Analytics Data...\n');

    // Total events count
    const totalEventsResult = await db.select({ count: count() }).from(analyticsEvents);
    console.log(`📊 Total Events: ${totalEventsResult[0]?.count || 0}`);

    // Unique sessions count
    const uniqueSessionsResult = await db.selectDistinct({ 
      sessionId: analyticsEvents.sessionId 
    }).from(analyticsEvents);
    console.log(`👥 Unique Sessions: ${uniqueSessionsResult.length}`);

    // Unique users count (new!)
    const uniqueUsersResult = await db.selectDistinct({ 
      userId: analyticsEvents.userId,
      sessionId: analyticsEvents.sessionId 
    }).from(analyticsEvents).where(eq(analyticsEvents.eventType, 'page_view'));
    
    // Calculate unique users (prefer userId, fallback to sessionId)
    const uniqueUserIds = new Set();
    uniqueUsersResult.forEach(visitor => {
      if (visitor.userId) {
        uniqueUserIds.add(visitor.userId);
      } else {
        uniqueUserIds.add(visitor.sessionId);
      }
    });
    console.log(`🧑‍💻 Unique Users (fingerprint-based): ${uniqueUserIds.size}`);

    // Show all unique session IDs
    console.log('\n🆔 Session IDs:');
    uniqueSessionsResult.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.sessionId}`);
    });

    // Show unique user IDs
    console.log('\n🔑 User IDs (fingerprints):');
    const userIdsResult = await db.selectDistinct({ 
      userId: analyticsEvents.userId 
    }).from(analyticsEvents).where(sql`${analyticsEvents.userId} IS NOT NULL`);
    userIdsResult.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.userId}`);
    });

    // Recent events by type
    const eventsByType = await db.select({
      eventType: analyticsEvents.eventType,
      count: count()
    }).from(analyticsEvents)
      .groupBy(analyticsEvents.eventType)
      .orderBy(desc(count()));

    console.log('\n📋 Events by Type:');
    eventsByType.forEach(event => {
      console.log(`  ${event.eventType}: ${event.count}`);
    });

    // Show recent events
    const recentEvents = await db.select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(10);

    console.log('\n🕒 Recent Events:');
    recentEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.eventType} - ${event.sessionId?.substring(0, 8)}... - ${event.page} - ${new Date(event.timestamp).toISOString()}`);
    });

    // Page views specifically
    const pageViewsResult = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.eventType, 'page_view'));
    console.log(`\n👁️  Total Page Views: ${pageViewsResult[0]?.count || 0}`);

    // Unique visitors for page views only
    const uniquePageViewSessions = await db.selectDistinct({ 
      sessionId: analyticsEvents.sessionId 
    }).from(analyticsEvents)
      .where(eq(analyticsEvents.eventType, 'page_view'));
    console.log(`👥 Unique Page View Sessions: ${uniquePageViewSessions.length}`);

  } catch (error) {
    console.error('❌ Error debugging analytics:', error);
  } finally {
    process.exit(0);
  }
}

debugAnalytics();
