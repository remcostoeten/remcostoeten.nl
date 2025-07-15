import "dotenv/config";
import {
	ensureHomeContentBlocks,
	getHomeContentBlocks,
	getHomeContentBlocksWithSegments,
} from "../src/lib/cms/seed-home-content";

async function testHomeContentUtils() {
	console.log("🧪 Testing home content utilities...");

	try {
		console.log("\n1. Testing ensureHomeContentBlocks()");
		const ensuredBlocks = await ensureHomeContentBlocks();
		console.log(`✅ Ensured ${ensuredBlocks.length} blocks exist`);

		console.log("\n2. Testing getHomeContentBlocks()");
		const blocks = await getHomeContentBlocks();
		console.log(`✅ Retrieved ${blocks.length} blocks`);

		console.log("\n3. Testing getHomeContentBlocksWithSegments()");
		const blocksWithSegments = await getHomeContentBlocksWithSegments();
		console.log(
			`✅ Retrieved ${blocksWithSegments.length} blocks with segments`,
		);

		console.log("\n📊 Block summary:");
		blocksWithSegments.forEach((block, index) => {
			console.log(
				`  ${index + 1}. ${block.blockType} (${block.segments.length} segments) - Order: ${block.order}`,
			);
		});

		console.log("\n✨ All utility functions are working correctly!");
	} catch (error) {
		console.error("❌ Error testing utilities:", error);
		throw error;
	}
}

testHomeContentUtils()
	.then(() => {
		console.log("\n🎉 Test completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Test failed:", error);
		process.exit(1);
	});
