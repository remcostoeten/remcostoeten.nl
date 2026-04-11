import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = new URL("..", import.meta.url);
const typescriptDir = new URL("../node_modules/typescript/", import.meta.url);
const packageJsonPath = new URL("./package.json", typescriptDir);

if (!existsSync(packageJsonPath)) {
	process.exit(0);
}

const typescriptPkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = typescriptPkg.version;
const targetFiles = ["lib/_tsc.js", "lib/typescript.js"];

const isPatched = targetFiles.some((relativePath) => {
	const content = readFileSync(new URL(relativePath, typescriptDir), "utf8");
	return content.includes("@effect-lsp-patch");
});

if (!isPatched) {
	process.exit(0);
}

const tempDir = mkdtempSync(join(tmpdir(), "typescript-repair-"));

try {
	const tarballName = execFileSync(
		"npm",
		["pack", `typescript@${version}`, "--pack-destination", tempDir],
		{ cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	).trim();
	const tarballPath = join(tempDir, tarballName);
	const extractDir = join(tempDir, "extract");

	execFileSync("mkdir", ["-p", extractDir], { stdio: "ignore" });
	execFileSync("tar", ["-xzf", tarballPath, "-C", extractDir], { stdio: "ignore" });

	for (const relativePath of targetFiles) {
		const sourcePath = join(extractDir, "package", relativePath);
		const targetPath = new URL(relativePath, typescriptDir);
		cpSync(sourcePath, targetPath);
	}

	console.log(`Repaired TypeScript ${version} compiler files.`);
} finally {
	rmSync(tempDir, { force: true, recursive: true });
}
