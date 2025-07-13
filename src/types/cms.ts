export interface Page {
	id: string;
	slug: string;
	title: string;
	description: string;
	isPublished: boolean;
	blocks: ContentBlock[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ContentBlock {
	id: string;
	type: "heading" | "paragraph";
	content: ContentSegment[];
	order: number;
	styles?: BlockStyles;
}

export interface BlockStyles {
	marginTop?: string;
	marginBottom?: string;
	paddingTop?: string;
	paddingBottom?: string;
	borderTop?: boolean;
	borderBottom?: boolean;
	borderLeft?: boolean;
	borderRight?: boolean;
}

export interface ContentSegment {
	id: string;
	type: "text" | "highlighted" | "link" | "project-card" | "github-commits" | "spotify-now-playing" | "api-endpoint";
	content: string;
	data?: {
		url?: string;
		hslColor?: string;
		backgroundColor?: string;
		borderRadius?: string;
		padding?: string;
		fontWeight?: "normal" | "medium" | "semibold" | "bold";
		fontSize?: "sm" | "base" | "lg" | "xl";
		projectData?: {
			title: string;
			description: string;
			technologies: string[];
			url?: string;
			github?: string;
		};
		// GitHub commits data
		repo?: string;
		perPage?: number;
		// API endpoint data
		endpointUrl?: string;
		refreshInterval?: number;
		template?: string;
	};
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: "admin" | "editor";
}

export interface CMSState {
	currentPage: Page | null;
	pages: Page[];
	user: User | null;
	isAuthenticated: boolean;
	isPreviewMode: boolean;
	editingSegment: string | null;
}
