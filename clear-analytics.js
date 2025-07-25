import { db } from './src/db/connection.ts';
import { analyticsEvents } from './src/db/schema.ts';

async function clearAnalytics() {
  try {
    console.log('🧹 Clearing analytics data...');
    
    const result = await db.delete(analyticsEvents);
    
    console.log('✅ Analytics data cleared successfully!');
    console.log('📊 You can now start with a clean slate.');
    
  } catch (error) {
    console.error('❌ Error clearing analytics:', error);
  } finally {
    process.exit(0);
  }
}

clearAnalytics();
