import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import dotenv from "dotenv";

dotenv.config();

async function setupProductionDatabase() {
  console.log("🚀 Setting up production database...");
  
  const prodDbUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!prodDbUrl) {
    console.error("❌ No database URL found!");
    console.log("Please set either:");
    console.log("  - PROD_DATABASE_URL for production");
    console.log("  - Or DATABASE_URL in your environment");
    process.exit(1);
  }
  
  try {
    const client = postgres(prodDbUrl, {
      ssl: prodDbUrl.includes('neon.tech') ? 'require' : false,
      max: 1,
    });
    
    const db = drizzle(client, { schema });
    
    console.log("✅ Connected to database");
    
    // Test the connection
    const result = await client`SELECT NOW() as current_time, version() as db_version`;
    console.log("📅 Database time:", result[0].current_time);
    console.log("🗄️  Database version:", result[0].db_version.split(' ')[0]);
    
    console.log("✅ Production database is ready!");
    console.log("📝 Next steps:");
    console.log("   1. Run 'npm run db:push' to sync schema");
    console.log("   2. Add DATABASE_URL to Vercel environment variables");
    console.log("   3. Test with 'npm run deploy'");
    
    await client.end();
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}

setupProductionDatabase();
