import { destroyDatabase } from "../src/db/destroy";

async function main() {
  try {
    console.log("🗑️  Destroying database tables...");
    await destroyDatabase();
    console.log("✅ Database tables destroyed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error destroying database:", error);
    process.exit(1);
  }
}

main();
