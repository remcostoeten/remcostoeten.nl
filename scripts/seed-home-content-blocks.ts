import "dotenv/config";
import { asc, eq } from "drizzle-orm";
import { db } from "../src/db/db";
import { contentBlocks, contentSegments } from "../src/db/schema";

const HOME_PAGE_ID = "home";

const REQUIRED_BLOCK_TYPES = [
	"heading",
	"paragraph",
	"paragraph",
	"paragraph",
	"paragraph",
	"paragraph",
];

const DEFAULT_CONTENT = [
	{
		blockType: "heading",
		segments: [{ type: "text", content: "Welcome to My Portfolio" }],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content:
					"I am a passionate developer with expertise in modern web technologies. My journey in software development has been driven by curiosity and a commitment to creating meaningful digital experiences.",
			},
		],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content:
					"With years of experience in full-stack development, I specialize in React, Next.js, TypeScript, and modern database technologies. I enjoy solving complex problems and building scalable applications.",
			},
		],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content:
					"My approach to development focuses on clean code, performance optimization, and user-centric design. I believe in continuous learning and staying updated with the latest industry trends and best practices.",
			},
		],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content:
					"When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community through articles and talks.",
			},
		],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content:
					"Feel free to explore my work and get in touch if you'd like to collaborate on interesting projects or discuss technology and development practices.",
			},
		],
	},
];

async function queryContentBlocks() {
	console.log(`🔍 Querying content blocks for pageId: ${HOME_PAGE_ID}`);

	const blocks = await db
		.select()
		.from(contentBlocks)
		.where(eq(contentBlocks.pageId, HOME_PAGE_ID))
		.orderBy(asc(contentBlocks.order))
		.execute();

	console.log(`📊 Found ${blocks.length} existing blocks`);
	return blocks;
}

async function queryContentSegments(blockId: number) {
	const segments = await db
		.select()
		.from(contentSegments)
		.where(eq(contentSegments.blockId, blockId))
		.orderBy(asc(contentSegments.order))
		.execute();

	return segments;
}

async function verifyRequiredSegmentTypes(blocks: any[]) {
	if (blocks.length === 0) {
		console.log("📝 No blocks found - seeding required");
		return false;
	}

	if (blocks.length !== REQUIRED_BLOCK_TYPES.length) {
		console.log(
			`📝 Expected ${REQUIRED_BLOCK_TYPES.length} blocks, found ${blocks.length} - seeding required`,
		);
		return false;
	}

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		const expectedType = REQUIRED_BLOCK_TYPES[i];

		if (block.blockType !== expectedType) {
			console.log(
				`📝 Block ${i + 1} type mismatch: expected ${expectedType}, got ${block.blockType} - seeding required`,
			);
			return false;
		}

		const segments = await queryContentSegments(block.id);
		if (segments.length === 0) {
			console.log(`📝 Block ${i + 1} has no segments - seeding required`);
			return false;
		}
	}

	console.log("✅ All required segment types are present");
	return true;
}

async function seedContentBlocks() {
	console.log("🌱 Starting to seed content blocks...");

	return await db.transaction(async (tx) => {
		console.log("🗑️ Cleaning existing blocks for idempotency");
		await tx
			.delete(contentBlocks)
			.where(eq(contentBlocks.pageId, HOME_PAGE_ID));

		for (let i = 0; i < DEFAULT_CONTENT.length; i++) {
			const blockData = DEFAULT_CONTENT[i];
			const order = i + 1;

			console.log(
				`📦 Creating block ${order}/${DEFAULT_CONTENT.length} (${blockData.blockType})`,
			);

			const [createdBlock] = await tx
				.insert(contentBlocks)
				.values({
					pageId: HOME_PAGE_ID,
					blockType: blockData.blockType,
					order: order,
				})
				.returning()
				.execute();

			for (let j = 0; j < blockData.segments.length; j++) {
				const segmentData = blockData.segments[j];
				const segmentOrder = j + 1;

				console.log(
					`  📝 Creating segment ${segmentOrder}/${blockData.segments.length} (${segmentData.type})`,
				);

				await tx
					.insert(contentSegments)
					.values({
						blockId: createdBlock.id,
						order: segmentOrder,
						text: segmentData.content,
						type: segmentData.type,
						href: null,
						target: null,
						className: null,
						style: null,
						metadata: null,
					})
					.execute();
			}
		}

		console.log("✅ Content blocks seeded successfully!");
	});
}

async function main() {
	console.log("🚀 Starting home content blocks seeding process...");

	try {
		const existingBlocks = await queryContentBlocks();

		const hasRequiredContent = await verifyRequiredSegmentTypes(existingBlocks);

		if (!hasRequiredContent) {
			console.log("📝 Seeding required - proceeding with content insertion");
			await seedContentBlocks();
		} else {
			console.log("⏭️  Skipping seeding - content already exists and is valid");
		}

		const finalBlocks = await queryContentBlocks();
		console.log(`🎉 Process completed! Total blocks: ${finalBlocks.length}`);

		for (const block of finalBlocks) {
			const segments = await queryContentSegments(block.id);
			console.log(
				`  📦 Block ${block.order}: ${block.blockType} (${segments.length} segments)`,
			);
		}
	} catch (error) {
		console.error("❌ Error during seeding process:", error);
		throw error;
	}
}

main()
	.then(() => {
		console.log("✨ Home content blocks seeding completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Seeding failed:", error);
		process.exit(1);
	});
