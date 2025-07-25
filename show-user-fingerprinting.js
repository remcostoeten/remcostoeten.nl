import { db } from './src/db/connection.ts';
import { analyticsEvents } from './src/db/schema.ts';
import { sql, desc, count, eq } from 'drizzle-orm';

async function showUserFingerprinting() {
  try {
    console.log('🔬 User Fingerprinting Analysis\n');
    console.log('=' * 50);

    // Get all events with userId and sessionId
    const eventsResult = await db.select({
      userId: analyticsEvents.userId,
      sessionId: analyticsEvents.sessionId,
      eventType: analyticsEvents.eventType,
      page: analyticsEvents.page,
      timestamp: analyticsEvents.timestamp
    }).from(analyticsEvents)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(20);

    // Group by userId to show how sessions relate to users
    const userSessions = new Map();
    
    eventsResult.forEach(event => {
      if (!event.userId) return;
      
      if (!userSessions.has(event.userId)) {
        userSessions.set(event.userId, new Set());
      }
      userSessions.get(event.userId).add(event.sessionId);
    });

    console.log('👤 USER → SESSION MAPPING:');
    console.log('-'.repeat(50));
    
    userSessions.forEach((sessions, userId) => {
      console.log(`\n🔑 User: ${userId}`);
      console.log(`📱 Sessions (${sessions.size}):`);
      sessions.forEach((sessionId, index) => {
        console.log(`   ${index + 1}. ${sessionId?.substring(0, 12)}...`);
      });
    });

    // Show the difference in metrics
    console.log('\n📊 METRICS COMPARISON:');
    console.log('-'.repeat(50));
    
    // Old way (session-based)
    const uniqueSessionsResult = await db.selectDistinct({ 
      sessionId: analyticsEvents.sessionId 
    }).from(analyticsEvents).where(eq(analyticsEvents.eventType, 'page_view'));
    
    // New way (user-based)
    const uniqueUsersResult = await db.selectDistinct({ 
      userId: analyticsEvents.userId,
      sessionId: analyticsEvents.sessionId 
    }).from(analyticsEvents).where(eq(analyticsEvents.eventType, 'page_view'));
    
    const uniqueUserIds = new Set();
    uniqueUsersResult.forEach(visitor => {
      if (visitor.userId) {
        uniqueUserIds.add(visitor.userId);
      } else {
        uniqueUserIds.add(visitor.sessionId);
      }
    });

    console.log(`\n📈 Session-based "Unique Visitors": ${uniqueSessionsResult.length}`);
    console.log(`🎯 User-based "Unique Visitors": ${uniqueUserIds.size}`);
    console.log(`📉 Difference: ${uniqueSessionsResult.length - uniqueUserIds.size} sessions were from the same user`);
    
    const accuracy = ((uniqueUserIds.size / uniqueSessionsResult.length) * 100).toFixed(1);
    console.log(`✅ User identification accuracy: ${accuracy}%`);

    console.log('\n🧠 HOW IT WORKS:');
    console.log('-'.repeat(50));
    console.log('1. 🖥️  Browser fingerprinting creates a stable user ID');
    console.log('2. 💾 localStorage stores the ID (survives regular sessions)');
    console.log('3. 🔄 Incognito mode gets same fingerprint → same user ID');
    console.log('4. 📊 Analytics now tracks actual unique users, not just sessions');
    console.log('5. 🎯 More accurate visitor metrics for your portfolio!');

  } catch (error) {
    console.error('❌ Error analyzing fingerprinting:', error);
  } finally {
    process.exit(0);
  }
}

showUserFingerprinting();
