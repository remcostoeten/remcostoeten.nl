import { NowPlaying } from "@/components/dynamic-data/now-playing";
import { ProjectCard } from "@/components/project-card";
import { TimeWidget } from "@/components/time-widget";
import { parseLinkMetadata } from "./link-metadata";
import { TContentSegment } from "./types";

type TProjectMeta = {
	title: string;
	description: string;
	url: string;
	demoUrl?: string;
	stars: number;
	branches: number;
	technologies: string[];
	lastUpdated: string;
	highlights: string[];
};

export function renderSegment(segment: TContentSegment) {
	switch (segment.type) {
		case "highlighted":
			return (
				<span
					key={segment.id}
					className="font-medium px-1 py-0.5 rounded"
					style={{
						backgroundColor: "hsl(var(--highlight-frontend) / 0.2)",
						color: "hsl(var(--highlight-frontend))",
					}}
				>
					{segment.content}
				</span>
			);

		case "link": {
			let linkProps = {
				href: segment.href || "#",
				target: segment.target || "_blank",
				rel: "noopener noreferrer",
				className: "text-accent hover:underline font-medium",
				suffix: " ↗",
			};

			if (segment.metadata) {
				try {
					const metadata = parseLinkMetadata(segment.metadata);
					linkProps = {
						href: metadata.href,
						target: metadata.target || "_blank",
						rel: metadata.rel || "noopener noreferrer",
						className:
							metadata.className || "text-accent hover:underline font-medium",
						suffix: metadata.suffix || " ↗",
					};
				} catch (error) {
					console.error("Failed to parse link metadata:", error);
				}
			}

			return (
				<a
					key={segment.id}
					href={linkProps.href}
					target={linkProps.target}
					rel={linkProps.rel}
					className={linkProps.className}
				>
					{segment.content}
					{linkProps.suffix}
				</a>
			);
		}

		case "project-card": {
			// Try to parse project data from metadata field
			if (segment.metadata) {
				try {
					const projectData: TProjectMeta = JSON.parse(segment.metadata);
					if (projectData && projectData.title) {
						return <ProjectCard key={segment.id} {...projectData} />;
					}
				} catch (error) {
					console.error("Failed to parse project metadata:", error);
				}
			}

			// Fallback for segments without proper metadata
			return (
				<span key={segment.id} className="font-medium text-accent">
					{segment.content}
				</span>
			);
		}

	case "time-widget":
		return (
			<span key={segment.id}>
				<TimeWidget config={segment.value} />
			</span>
		);

	case "spotify-now-playing":
		return (
			<span key={segment.id}>
				<NowPlaying />
			</span>
		);

		case "api-endpoint":
			return <span key={segment.id}>{segment.content}</span>;

		default:
			return <span key={segment.id}>{segment.content}</span>;
	}
}
