import { createTestFactory } from "./src/db/factories/test-factory";
import { config } from "dotenv";

config();

async function testDatabase() {
  console.log("Testing database connection...");
  
  const testFactory = createTestFactory();
  
  const isConnected = await testFactory.testConnection();
  
  if (isConnected) {
    console.log("✅ Database connection successful!");
    
    const projects = await testFactory.read();
    console.log(`📊 Found ${projects.length} projects in database`);
    
    if (projects.length > 0) {
      console.log("📋 Sample project:", {
        title: projects[0].title,
        status: projects[0].status,
        technologies: projects[0].technologies,
      });
    }
  } else {
    console.log("❌ Database connection failed!");
    process.exit(1);
  }
}

testDatabase().catch(console.error);
