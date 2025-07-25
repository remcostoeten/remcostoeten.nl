import { db } from "./connection";
import { sql } from "drizzle-orm";

export async function destroyDatabase() {
  await db.execute(sql`DROP TABLE IF EXISTS projects CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS skills CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS experience CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS siteSettings CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS contactSubmissions CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS analyticsEvents CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS projectImages CASCADE`);
}