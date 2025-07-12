import { nanoid } from "nanoid";
import { getDb, tables } from "./client";

async function seedHomePage() {
	const db = getDb();

	// Insert the page row
	const pageId = nanoid();
	await db
		.insert(tables.pages)
		.values({
			id: pageId,
			slug: "home",
			title: "Home",
		})
		.execute();

	// Insert the heading block
	const headingBlockId = nanoid();
	await db
		.insert(tables.contentBlocks)
		.values({
			id: headingBlockId,
			pageId,
			blockType: "heading",
			order: 1,
		})
		.execute();

	await db
		.insert(tables.contentSegments)
		.values({
			id: nanoid(),
			blockId: headingBlockId,
			order: 1,
			text: "I craft digital experiences.",
			type: "text",
		})
		.execute();

	// Insert the paragraph block
	const paragraphBlockId = nanoid();
	await db
		.insert(tables.contentBlocks)
		.values({
			id: paragraphBlockId,
			pageId,
			blockType: "paragraph",
			order: 2,
		})
		.execute();

	const contentSegments = [
		{ text: "With extensive experience in ", type: "text" },
		{ text: "TypeScript and React & Next.js", type: "highlighted" },
		{
			text: ", I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an ",
			type: "text",
		},
		{ text: "LMS system for Dutch MBO students", type: "highlighted" },
		{ text: ".", type: "text" },
	];

	let order = 1;
	for (const segment of contentSegments) {
		await db
			.insert(tables.contentSegments)
			.values({
				id: nanoid(),
				blockId: paragraphBlockId,
				order: order++,
				text: segment.text,
				type: segment.type,
			})
			.execute();
	}

	// Add project-card content as well, represented as JSON

	await db
		.insert(tables.contentSegments)
		.values({
			id: nanoid(),
			blockId: paragraphBlockId,
			order: order++,
			text: JSON.stringify({
				title: "Roll Your Own Authentication",
				description:
					"A comprehensive Next.js 15 authentication system showcasing how to implement JWT-based auth without external services like Lucia, NextAuth, or Clerk. Features secure PostgreSQL storage, admin roles, onboarding flows, and more.",
				url: "https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication",
				demoUrl: "https://ryoa.vercel.app/",
				stars: 0,
				branches: 34,
				technologies: [
					"Next.js 15",
					"TypeScript",
					"PostgreSQL",
					"JWT",
					"Tailwind CSS",
				],
				lastUpdated: "recently",
				highlights: [
					"JWT authentication without external services",
					"Secure PostgreSQL user storage",
					"Admin role management system",
					"Configurable onboarding flows",
					"Modern Next.js 15 features",
				],
			}),
			type: "project-card",
		})
		.execute();
}

seedHomePage()
	.then(() => console.log("Seeding complete"))
	.catch(console.error);
