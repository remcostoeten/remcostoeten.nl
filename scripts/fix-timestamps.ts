#!/usr/bin/env bun
import { eq, sql } from "drizzle-orm";
import { db } from "../src/db/db";
import {
	contentBlocks,
	contentSegments,
	feedback,
	pages,
	stylePresets,
	users,
} from "../src/db/schema";

async function fixTimestamps() {
	console.log("🔧 Fixing timestamp data...");

	const currentTime = new Date().toISOString();

	try {
		// Fix pages table
		console.log("Fixing pages table...");
		await db
			.update(pages)
			.set({
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.where(eq(pages.createdAt, "CURRENT_TIMESTAMP"));

		// Fix content_blocks table
		console.log("Fixing content_blocks table...");
		await db
			.update(contentBlocks)
			.set({
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.where(eq(contentBlocks.createdAt, "CURRENT_TIMESTAMP"));

		// Fix content_segments table
		console.log("Fixing content_segments table...");
		await db
			.update(contentSegments)
			.set({
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.where(eq(contentSegments.createdAt, "CURRENT_TIMESTAMP"));

		// Fix feedback table
		console.log("Fixing feedback table...");
		await db
			.update(feedback)
			.set({
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.where(eq(feedback.createdAt, "CURRENT_TIMESTAMP"));

		// Fix users table
		console.log("Fixing users table...");
		await db
			.update(users)
			.set({
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.where(eq(users.createdAt, "CURRENT_TIMESTAMP"));

		// Fix style_presets table
		console.log("Fixing style_presets table...");
		await db
			.update(stylePresets)
			.set({
				createdAt: sql`datetime('now')`,
				updatedAt: sql`datetime('now')`,
			})
			.where(eq(stylePresets.createdAt, "CURRENT_TIMESTAMP"));

		console.log("✅ All timestamp data fixed successfully!");
	} catch (error) {
		console.error("❌ Error fixing timestamps:", error);
		throw error;
	}
}

fixTimestamps()
	.then(() => {
		console.log("🎉 Timestamp fix completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Timestamp fix failed:", error);
		process.exit(1);
	});
