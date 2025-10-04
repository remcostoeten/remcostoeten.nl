import { db } from '../db';
import { blogMetadata, blogAnalytics } from '../schema/blog-metadata';
import { eq } from 'drizzle-orm';

async function initializeBlogAnalytics() {
  console.log('🔄 Initializing blog analytics records...');
  
  try {
    const allPosts = await db.select().from(blogMetadata);
    
    console.log(`📊 Found ${allPosts.length} blog posts`);
    
    let created = 0;
    let existing = 0;
    
    for (const post of allPosts) {
      const [existingAnalytics] = await db
        .select()
        .from(blogAnalytics)
        .where(eq(blogAnalytics.slug, post.slug))
        .limit(1);
      
      if (!existingAnalytics) {
        await db.insert(blogAnalytics).values({
          id: crypto.randomUUID(),
          slug: post.slug,
          totalViews: 0,
          uniqueViews: 0,
          recentViews: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        created++;
        console.log(`✅ Created analytics for: ${post.slug}`);
      } else {
        existing++;
        console.log(`⏭️  Analytics already exists for: ${post.slug}`);
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`  Total posts: ${allPosts.length}`);
    console.log(`  Created: ${created}`);
    console.log(`  Already existing: ${existing}`);
    console.log('\n✅ Blog analytics initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing blog analytics:', error);
    throw error;
  }
}

async function main() {
  try {
    await initializeBlogAnalytics();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
