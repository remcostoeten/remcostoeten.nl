import {
	createLinkMetadata,
	parseLinkMetadata,
	serializeLinkMetadata,
} from "../src/lib/cms/link-metadata";
import {
	createExternalLinkSegment,
	createGitHubLinkSegment,
	createInternalLinkSegment,
	createLinkSegment,
} from "../src/lib/cms/link-segment-helpers";

// Example 1: Creating link metadata with all options
const externalLinkMetadata = createLinkMetadata({
	href: "https://github.com/user/repo",
	target: "_blank",
	rel: "noopener noreferrer",
	className: "external-link hover:underline",
	suffix: " ↗",
});

console.log("External Link Metadata:", externalLinkMetadata);

// Example 2: Creating link metadata with minimal options (uses defaults)
const simpleMetadata = createLinkMetadata({
	href: "https://example.com",
});

console.log("Simple Metadata:", simpleMetadata);

// Example 3: Serializing metadata for database storage
const serialized = serializeLinkMetadata(externalLinkMetadata);
console.log("Serialized for DB:", serialized);

// Example 4: Parsing metadata from database
const parsedMetadata = parseLinkMetadata(serialized);
console.log("Parsed from DB:", parsedMetadata);

// Example 5: Creating different types of link segments

// External link segment
const externalSegment = createExternalLinkSegment({
	id: 1,
	content: "Visit GitHub",
	href: "https://github.com",
	order: 1,
	customClassName: "github-link text-blue-600 hover:underline",
	customSuffix: " →",
});

console.log("External Segment:", externalSegment);

// Internal link segment
const internalSegment = createInternalLinkSegment({
	id: 2,
	content: "Go to Dashboard",
	href: "/dashboard",
	order: 2,
	customClassName: "nav-link",
});

console.log("Internal Segment:", internalSegment);

// GitHub-specific link segment
const githubSegment = createGitHubLinkSegment({
	id: 3,
	content: "View Repository",
	href: "https://github.com/user/repo",
	order: 3,
});

console.log("GitHub Segment:", githubSegment);

// Example 6: Database insertion example
const databaseExample = {
	id: 4,
	blockId: 1,
	order: 1,
	text: "Check out our documentation",
	type: "link",
	href: null, // Will be read from metadata
	target: null, // Will be read from metadata
	className: null, // Will be read from metadata
	style: null,
	metadata: serializeLinkMetadata(
		createLinkMetadata({
			href: "https://docs.example.com",
			target: "_blank",
			rel: "noopener noreferrer",
			className: "docs-link text-blue-600 hover:underline font-medium",
			suffix: " 📄",
		}),
	),
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

console.log("Database Example:", databaseExample);

// Example 7: Handling different link types in a factory function
function createLinkByType(
	type: "external" | "internal" | "github" | "docs",
	options: {
		id: number;
		content: string;
		href: string;
		order?: number;
	},
) {
	switch (type) {
		case "external":
			return createExternalLinkSegment(options);
		case "internal":
			return createInternalLinkSegment(options);
		case "github":
			return createGitHubLinkSegment(options);
		case "docs":
			return createLinkSegment({
				...options,
				linkOptions: {
					href: options.href,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "docs-link text-blue-600 hover:underline",
					suffix: " 📄",
				},
			});
		default:
			throw new Error(`Unknown link type: ${type}`);
	}
}

// Usage of factory function
const factoryExample = createLinkByType("github", {
	id: 5,
	content: "Star this project",
	href: "https://github.com/user/repo",
	order: 1,
});

console.log("Factory Example:", factoryExample);

export {
	externalLinkMetadata,
	simpleMetadata,
	serialized,
	parsedMetadata,
	externalSegment,
	internalSegment,
	githubSegment,
	databaseExample,
	createLinkByType,
};
