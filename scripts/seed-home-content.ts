import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db/db";
import { contentBlocks, contentSegments } from "../src/db/schema";

const homePageSlug = "home";

async function seedHomeContent() {
	console.log("🌱 Starting to seed home content...");

	try {
		// Clear existing home content
		await db
			.delete(contentBlocks)
			.where(eq(contentBlocks.pageId, homePageSlug));

		// Insert main heading block
		const [headingBlock] = await db
			.insert(contentBlocks)
			.values({
				pageId: homePageSlug,
				blockType: "heading",
				order: 1,
			})
			.returning();

		// Insert heading text
		await db.insert(contentSegments).values({
			blockId: headingBlock.id,
			order: 1,
			text: "I build digital things.",
			type: "text",
		});

		// Insert introduction paragraph block
		const [introBlock] = await db
			.insert(contentBlocks)
			.values({
				pageId: homePageSlug,
				blockType: "paragraph",
				order: 2,
			})
			.returning();

		// Insert introduction text segments
		await db.insert(contentSegments).values([
			{
				blockId: introBlock.id,
				order: 1,
				text: "I'm a ",
				type: "text",
			},
			{
				blockId: introBlock.id,
				order: 2,
				text: "Frontend Developer",
				type: "text",
				className: "text-green-400",
			},
			{
				blockId: introBlock.id,
				order: 3,
				text: " focused on creating efficient and maintainable web applications. I work remotely from Lemmer, Netherlands.",
				type: "text",
			},
		]);

		// Insert projects paragraph block
		const [projectsBlock] = await db
			.insert(contentBlocks)
			.values({
				pageId: homePageSlug,
				blockType: "paragraph",
				order: 3,
			})
			.returning();

		// Insert projects text segments
		await db.insert(contentSegments).values([
			{
				blockId: projectsBlock.id,
				order: 1,
				text: "Recently I've been working on ",
				type: "text",
			},
			{
				blockId: projectsBlock.id,
				order: 2,
				text: "Roll Your Own Authentication",
				type: "link",
				className: "text-green-400 underline",
				href: "https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication",
				target: "_blank",
			},
			{
				blockId: projectsBlock.id,
				order: 3,
				text: " and ",
				type: "text",
			},
			{
				blockId: projectsBlock.id,
				order: 4,
				text: "Turso DB Creator CLI",
				type: "link",
				className: "text-green-400 underline",
				href: "https://github.com/remcostoeten/turso-db-creator-cli",
				target: "_blank",
			},
			{
				blockId: projectsBlock.id,
				order: 5,
				text: ". You can explore more of my work on ",
				type: "text",
			},
			{
				blockId: projectsBlock.id,
				order: 6,
				text: "GitHub",
				type: "project-card",
				metadata: JSON.stringify({
					title: "GitHub",
					description:
						"Explore my open-source projects and contributions. I work on various full-stack applications, CLI tools, and Next.js projects.",
					url: "https://github.com/remcostoeten",
					stars: 47,
					branches: 23,
					technologies: [
						"TypeScript",
						"Next.js",
						"React",
						"Node.js",
						"Tailwind CSS",
						"Drizzle ORM",
					],
					lastUpdated: "2 hours ago",
					highlights: [
						"15+ public repositories",
						"Full-stack web applications",
						"CLI tools and utilities",
						"Modern TypeScript patterns",
					],
				}),
			},
			{
				blockId: projectsBlock.id,
				order: 7,
				text: ".",
				type: "text",
			},
		]);

		// Insert contact paragraph block
		const [contactBlock] = await db
			.insert(contentBlocks)
			.values({
				pageId: homePageSlug,
				blockType: "paragraph",
				order: 4,
			})
			.returning();

		// Insert contact text segments
		await db.insert(contentSegments).values([
			{
				blockId: contactBlock.id,
				order: 1,
				text: "Connect with me on ",
				type: "text",
			},
			{
				blockId: contactBlock.id,
				order: 2,
				text: "LinkedIn",
				type: "link",
				className: "text-green-400 underline",
				href: "https://linkedin.com/in/remcostoeten",
				target: "_blank",
			},
			{
				blockId: contactBlock.id,
				order: 3,
				text: " or through ",
				type: "text",
			},
			{
				blockId: contactBlock.id,
				order: 4,
				text: "my website",
				type: "link",
				className: "text-green-400 underline",
				href: "https://remcostoeten.nl",
				target: "_blank",
			},
			{
				blockId: contactBlock.id,
				order: 5,
				text: ". I'm currently working at ",
				type: "text",
			},
			{
				blockId: contactBlock.id,
				order: 6,
				text: "@exactonline",
				type: "text",
				className: "text-green-400",
			},
			{
				blockId: contactBlock.id,
				order: 7,
				text: ".",
				type: "text",
			},
		]);

		// Insert timezone paragraph block
		const [timezoneBlock] = await db
			.insert(contentBlocks)
			.values({
				pageId: homePageSlug,
				blockType: "paragraph",
				order: 5,
			})
			.returning();

		// Insert timezone text segments
		await db.insert(contentSegments).values([
			{
				blockId: timezoneBlock.id,
				order: 1,
				text: "My current timezone is UTC+1 which includes countries like Ireland, Morocco and Portugal. Right now it is ",
				type: "text",
			},
			{
				blockId: timezoneBlock.id,
				order: 2,
				text: "00:05:43",
				type: "text",
				className: "text-green-400",
			},
			{
				blockId: timezoneBlock.id,
				order: 3,
				text: ".",
				type: "text",
			},
		]);

		console.log("✅ Home content seeded successfully!");
	} catch (error) {
		console.error("❌ Error seeding home content:", error);
		throw error;
	}
}

seedHomeContent()
	.then(() => {
		console.log("🎉 Seeding completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Seeding failed:", error);
		process.exit(1);
	});
