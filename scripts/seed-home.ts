#!/usr/bin/env tsx

import { ensureHomeContentBlocks } from "../src/lib/cms/seed-home-content";

async function main() {
  console.log("🌱 Starting home page seed...");
  
  try {
    await ensureHomeContentBlocks();
    console.log("✅ Home page seed completed successfully!");
    console.log("🎉 You can now edit the home page in your CMS admin!");
  } catch (error) {
    console.error("❌ Error seeding home page:", error);
    process.exit(1);
  }
}

main();
