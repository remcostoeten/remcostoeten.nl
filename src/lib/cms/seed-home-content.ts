import { asc, eq } from "drizzle-orm";
import { db } from "@/db/db";
import { contentBlocks, contentSegments, pages } from "@/db/schema";

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
		segments: [
			{ type: "text", content: "Welcome to My Portfolio" },
			{
				type: "time-widget",
				content: "",
				metadata: JSON.stringify({
					id: "tw-header",
					timezone: "America/New_York",
					format: "12h",
					showSeconds: false,
					label: "Current Time",
				}),
			},
		],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content: "I am a passionate developer with expertise in ",
			},
			{
				type: "highlighted",
				content: "modern web technologies",
				metadata: JSON.stringify({
					hslColor: "var(--highlight-frontend)",
					backgroundColor: "hsl(var(--highlight-frontend) / 0.2)",
				}),
			},
			{
				type: "text",
				content: ". My journey in software development has been driven by curiosity and a commitment to creating meaningful digital experiences.",
			},
		],
	},
	{
		blockType: "paragraph",
		segments: [
			{
				type: "text",
				content: "With years of experience in full-stack development, I specialize in ",
			},
			{
				type: "highlighted",
				content: "React",
				metadata: JSON.stringify({
					hslColor: "200 100% 70%",
					backgroundColor: "hsl(200 100% 70% / 0.15)",
				}),
			},
			{
				type: "text",
				content: ", ",
			},
			{
				type: "highlighted",
				content: "Next.js",
				metadata: JSON.stringify({
					hslColor: "280 100% 70%",
					backgroundColor: "hsl(280 100% 70% / 0.15)",
				}),
			},
			{
				type: "text",
				content: ", ",
			},
			{
				type: "highlighted",
				content: "TypeScript",
				metadata: JSON.stringify({
					hslColor: "45 100% 65%",
					backgroundColor: "hsl(45 100% 65% / 0.15)",
				}),
			},
			{
				type: "text",
				content: ", and modern database technologies. I enjoy solving complex problems and building scalable applications.",
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
	const blocks = await db
		.select()
		.from(contentBlocks)
		.where(eq(contentBlocks.pageId, HOME_PAGE_ID))
		.orderBy(asc(contentBlocks.order))
		.execute();

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
		return false;
	}

	if (blocks.length !== REQUIRED_BLOCK_TYPES.length) {
		return false;
	}

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		const expectedType = REQUIRED_BLOCK_TYPES[i];

		if (block.blockType !== expectedType) {
			return false;
		}

		const segments = await queryContentSegments(block.id);
		if (segments.length === 0) {
			return false;
		}
	}

	return true;
}

async function ensureHomePageExists() {
	// Check if home page exists
	const existingPage = await db
		.select()
		.from(pages)
		.where(eq(pages.slug, HOME_PAGE_ID))
		.limit(1)
		.execute();

	if (existingPage.length === 0) {
		// Create home page
		await db
			.insert(pages)
			.values({
				slug: HOME_PAGE_ID,
				title: "Home",
				description: "Welcome to my portfolio - showcasing my work and expertise",
				isPublished: 1,
				isHomepage: 1,
			})
			.execute();
		console.log(`✅ Created home page in pages table`);
	} else {
		console.log(`ℹ️  Home page already exists in pages table`);
	}
}

async function seedContentBlocks() {
	return await db.transaction(async (tx) => {
		await tx
			.delete(contentBlocks)
			.where(eq(contentBlocks.pageId, HOME_PAGE_ID));

		for (let i = 0; i < DEFAULT_CONTENT.length; i++) {
			const blockData = DEFAULT_CONTENT[i];
			const order = i + 1;

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
				const segmentData = blockData.segments[j] as any;
				const segmentOrder = j + 1;

				await tx
					.insert(contentSegments)
					.values({
						blockId: createdBlock.id,
						order: segmentOrder,
						text: segmentData.content || "",
						type: segmentData.type,
						href: null,
						target: null,
						className: null,
						style: null,
						metadata: segmentData.metadata || null,
					})
					.execute();
			}
		}
	});
}

export async function ensureHomeContentBlocks() {
	// First, ensure the home page exists in the pages table
	await ensureHomePageExists();

	const existingBlocks = await queryContentBlocks();

	const hasRequiredContent = await verifyRequiredSegmentTypes(existingBlocks);

	if (!hasRequiredContent) {
		console.log(`🔄 Seeding home page content...`);
		await seedContentBlocks();
		console.log(`✅ Home page content seeded successfully`);
		return await queryContentBlocks();
	}

	console.log(`ℹ️  Home page content already exists`);
	return existingBlocks;
}

export async function getHomeContentBlocks() {
	return await queryContentBlocks();
}

export async function getHomeContentBlocksWithSegments() {
	const blocks = await queryContentBlocks();

	const blocksWithSegments = await Promise.all(
		blocks.map(async (block) => {
			const segments = await queryContentSegments(block.id);
			return {
				...block,
				segments,
			};
		}),
	);

	return blocksWithSegments;
}
