import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db/db";
import { contentBlocks, contentSegments } from "../src/db/schema";

type TProjectCardData = {
	title: string;
	description: string;
	url: string;
	demoUrl?: string;
	stars: number;
	branches: number;
	technologies: string[];
	lastUpdated: string;
	highlights: string[];
};

const projectCards: Record<string, TProjectCardData> = {
	"roll-your-own-auth": {
		title: "Roll Your Own Authentication",
		description:
			"A comprehensive authentication system built with Next.js and TypeScript",
		url: "https://github.com/remcostoeten/roll-your-own-auth",
		demoUrl: "https://auth-demo.remcostoeten.nl",
		stars: 45,
		branches: 8,
		technologies: ["Next.js", "TypeScript", "Drizzle ORM", "SQLite"],
		lastUpdated: "2024-01-15",
		highlights: ["JWT implementation", "Role-based access", "Password reset"],
	},
	"turso-db-cli": {
		title: "Turso DB Creator CLI",
		description: "Command line tool for creating and managing Turso databases",
		url: "https://github.com/remcostoeten/turso-db-cli",
		demoUrl: "https://www.npmjs.com/package/turso-db-cli",
		stars: 23,
		branches: 4,
		technologies: ["Node.js", "TypeScript", "Commander.js", "Turso"],
		lastUpdated: "2024-01-08",
		highlights: ["Database creation", "Migration support", "CLI interface"],
	},
};

async function verifyAndLogResults() {
	console.log("🔍 Verifying seeded data...");

	try {
		// Select project-card segments count
		const projectCardSegments = await db
			.select()
			.from(contentSegments)
			.where(eq(contentSegments.type, "project-card"));

		// Select content blocks count for home page
		const homePageBlocks = await db
			.select()
			.from(contentBlocks)
			.where(eq(contentBlocks.pageId, "home"));

		// Log counts
		console.log(`📊 Verification Results:`);
		console.log(
			`   • Total content blocks for home page: ${homePageBlocks.length}`,
		);
		console.log(
			`   • Total project-card segments: ${projectCardSegments.length}`,
		);

		// Log IDs and titles
		if (projectCardSegments.length > 0) {
			console.log(`📋 Project Card Segments:`);
			projectCardSegments.forEach((segment) => {
				let title = segment.text;

				// Try to extract title from metadata if available
				if (segment.metadata) {
					try {
						const metadata = JSON.parse(segment.metadata);
						title = metadata.title || segment.text;
					} catch {
						// Keep original text if metadata parsing fails
					}
				}

				console.log(
					`   • ID: ${segment.id} | Title: "${title}" | Type: ${segment.type}`,
				);
			});
		}

		if (homePageBlocks.length > 0) {
			console.log(`📋 Home Page Content Blocks:`);
			homePageBlocks.forEach((block) => {
				console.log(
					`   • ID: ${block.id} | Type: ${block.blockType} | Order: ${block.order}`,
				);
			});
		}

		// Success message
		console.log("✅ Verification completed successfully!");
	} catch (error) {
		console.error("❌ Error during verification:", error);
		throw error;
	}
}

async function seedProjectCards() {
	console.log("🌱 Starting to seed project cards...");

	try {
		// First, check if home page exists, if not create it
		const existingBlocks = await db
			.select()
			.from(contentBlocks)
			.where(eq(contentBlocks.pageId, "home"));

		if (existingBlocks.length === 0) {
			console.log("📄 Creating home page content blocks...");

			// Create a paragraph block for project cards
			const [insertedBlock] = await db
				.insert(contentBlocks)
				.values({
					pageId: "home",
					blockType: "paragraph",
					order: 1,
				})
				.returning({ id: contentBlocks.id });

			// Create project-card segments
			let segmentOrder = 0;
			for (const [projectKey, projectData] of Object.entries(projectCards)) {
				console.log(`📦 Creating project card segment: ${projectData.title}`);

				await db.insert(contentSegments).values({
					blockId: insertedBlock.id,
					text: projectKey, // Use the key as content identifier
					type: "project-card",
					order: segmentOrder,
					metadata: JSON.stringify(projectData), // Store project data in metadata
				});

				segmentOrder++;
			}
		} else {
			console.log("📄 Home page blocks already exist, adding project cards...");

			// Find a paragraph block to add project cards to, or create one
			let targetBlock = existingBlocks.find(
				(block) => block.blockType === "paragraph",
			);

			if (!targetBlock) {
				const [insertedBlock] = await db
					.insert(contentBlocks)
					.values({
						pageId: "home",
						blockType: "paragraph",
						order: existingBlocks.length,
					})
					.returning({ id: contentBlocks.id });
				targetBlock = {
					id: insertedBlock.id,
					pageId: "home",
					blockType: "paragraph",
					order: existingBlocks.length,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
			}

			// Check if project cards already exist
			const existingSegments = await db
				.select()
				.from(contentSegments)
				.where(eq(contentSegments.blockId, targetBlock.id));

			const existingProjectCards = existingSegments.filter(
				(seg) => seg.type === "project-card",
			);

			if (existingProjectCards.length > 0) {
				console.log("⚠️  Project cards already exist, skipping seeding...");
				console.log("✅ Seeding skipped - data already exists!");

				// Still verify and log results
				await verifyAndLogResults();
				return;
			}

			// Add project cards to the block
			let segmentOrder = existingSegments.length;
			for (const [projectKey, projectData] of Object.entries(projectCards)) {
				console.log(`📦 Creating project card segment: ${projectData.title}`);

				await db.insert(contentSegments).values({
					blockId: targetBlock.id,
					text: projectKey,
					type: "project-card",
					order: segmentOrder,
					metadata: JSON.stringify(projectData),
				});

				segmentOrder++;
			}
		}

		console.log("✅ Project cards seeded successfully!");

		// Verify and log results
		await verifyAndLogResults();
	} catch (error) {
		console.error("❌ Error seeding project cards:", error);
		throw error;
	}
}

// Run the seed function
seedProjectCards()
	.then(() => {
		console.log("✨ Project cards seeding completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Project cards seeding failed:", error);
		process.exit(1);
	});
