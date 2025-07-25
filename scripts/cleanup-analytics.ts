import { db } from '../src/db/connection';
import { analyticsEvents } from '../src/db/schema';
import { sql, lt, eq, and } from 'drizzle-orm';

function cleanupAnalyticsEvents() {
  console.log('🧹 Starting analytics cleanup...');
  
  return new Promise<void>((resolve, reject) => {
    const cleanup = async () => {
      try {
        // 1. Remove duplicate session_start events (keep only the first one per session)
        console.log('Removing duplicate session_start events...');
        const duplicateSessionStarts = await db.execute(sql`
          DELETE FROM analytics_events 
          WHERE id IN (
            SELECT id FROM (
              SELECT id, 
                ROW_NUMBER() OVER (
                  PARTITION BY session_id, event_type 
                  ORDER BY timestamp ASC
                ) as rn
              FROM analytics_events 
              WHERE event_type = 'session_start'
            ) t 
            WHERE t.rn > 1
          )
        `);
        console.log(`✅ Removed ${duplicateSessionStarts.rowCount || 0} duplicate session_start events`);

        // 2. Remove old events (older than 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        console.log(`Removing events older than ${thirtyDaysAgo.toISOString()}...`);
        
        const oldEvents = await db
          .delete(analyticsEvents)
          .where(lt(analyticsEvents.timestamp, thirtyDaysAgo));
        
        console.log(`✅ Removed ${oldEvents.rowCount || 0} old events`);

        // 3. Remove excessive page view events from the same session within short time periods
        console.log('Removing excessive page view events...');
        const excessivePageViews = await db.execute(sql`
          DELETE FROM analytics_events 
          WHERE id IN (
            SELECT id FROM (
              SELECT id,
                ROW_NUMBER() OVER (
                  PARTITION BY session_id, page, event_type,
                  DATE_TRUNC('minute', timestamp)
                  ORDER BY timestamp ASC
                ) as rn
              FROM analytics_events 
              WHERE event_type = 'page_view'
            ) t 
            WHERE t.rn > 2
          )
        `);
        console.log(`✅ Removed ${excessivePageViews.rowCount || 0} excessive page view events`);

        // 4. Get final statistics
        const totalEvents = await db
          .select({ count: sql<number>`count(*)` })
          .from(analyticsEvents);
        
        console.log(`📊 Total events remaining: ${totalEvents[0]?.count || 0}`);
        
        // 5. Analyze the database
        console.log('🔧 Analyzing database for optimization...');
        await db.execute(sql`ANALYZE analytics_events`);
        
        console.log('✨ Analytics cleanup completed successfully!');
        resolve();
        
      } catch (error) {
        console.error('❌ Analytics cleanup failed:', error);
        reject(error);
      }
    };

    cleanup();
  });
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupAnalyticsEvents()
    .then(() => {
      console.log('🎉 Cleanup finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupAnalyticsEvents };
