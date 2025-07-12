#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting optimized build process...");

// Clean previous builds
console.log("🧹 Cleaning previous builds...");
try {
	execSync("rm -rf .next out", { stdio: "inherit" });
} catch (error) {
	console.log("No previous builds to clean");
}

// Type check
console.log("🔍 Running type check...");
try {
	execSync("npx tsc --noEmit", { stdio: "inherit" });
	console.log("✅ Type check passed");
} catch (error) {
	console.error("❌ Type check failed");
	process.exit(1);
}

// Build
console.log("🏗️ Building application...");
try {
	execSync("next build", { stdio: "inherit" });
	console.log("✅ Build completed successfully");
} catch (error) {
	console.error("❌ Build failed");
	process.exit(1);
}

// Analyze bundle size
console.log("📊 Analyzing bundle size...");
const buildManifest = path.join(".next", "build-manifest.json");
if (fs.existsSync(buildManifest)) {
	const manifest = JSON.parse(fs.readFileSync(buildManifest, "utf8"));
	console.log("📦 Bundle analysis:");
	console.log(`- Pages: ${Object.keys(manifest.pages).length}`);
	console.log(`- Static files: ${manifest.sortedPages?.length || 0}`);
}

console.log("🎉 Build optimization complete!");
