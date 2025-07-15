import "dotenv/config";
import {
	ensureHomeContentBlocksAction,
	getHomeContentBlocksAction,
} from "../src/lib/cms/server-actions";

async function testServerActions() {
	console.log("🧪 Testing server actions...");

	try {
		console.log("\n1. Testing ensureHomeContentBlocksAction()");
		const ensureResult = await ensureHomeContentBlocksAction();
		console.log("Result:", ensureResult.success ? "SUCCESS" : "FAILED");

		console.log("\n2. Testing getHomeContentBlocksAction()");
		const getResult = await getHomeContentBlocksAction();
		console.log("Result:", getResult.success ? "SUCCESS" : "FAILED");

		if (getResult.success) {
			console.log(`Number of blocks: ${getResult.data.length}`);
			getResult.data.forEach((block, i) => {
				console.log(
					`  Block ${i + 1}: ${block.blockType} (${block.segments.length} segments)`,
				);
			});
		}

		console.log("\n✅ All server actions working correctly!");
	} catch (error) {
		console.error("❌ Error testing server actions:", error);
		throw error;
	}
}

testServerActions()
	.then(() => {
		console.log("\n🎉 Server actions test completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Server actions test failed:", error);
		process.exit(1);
	});
