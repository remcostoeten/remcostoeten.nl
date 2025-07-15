"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { LastCommit } from "@/components/dynamic-data/last-commit";
import { FyncGithubDemo } from "@/components/fync-github-demo";
import { renderSegment } from "@/lib/cms/renderSegment";
import { TContentBlock, TContentSegment, TPageContent } from "@/lib/cms/types";

function getFormattedTime() {
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const utcPlus1 = new Date(utcTime + 1 * 3600000);
	return utcPlus1.toTimeString().split(" ")[0];
}

type TProps = {
	initialContent: TPageContent;
};

export function CMSIndexView({ initialContent }: TProps) {
	const [currentTime, setCurrentTime] = useState<string>(getFormattedTime());
	const [isContactHovered, setIsContactHovered] = useState(false);
	const [shouldOpenAbove, setShouldOpenAbove] = useState(false);
	const [homePageContent] = useState<TPageContent>(initialContent);

	useEffect(function setupTimeInterval() {
		function updateTime() {
			setCurrentTime(getFormattedTime());
		}

		const interval = setInterval(updateTime, 1000);
		return function cleanup() {
			clearInterval(interval);
		};
	}, []);

	function handleContactHover(e: React.MouseEvent<HTMLSpanElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - rect.bottom;
		const formHeight = 400;

		setShouldOpenAbove(spaceBelow < formHeight);
		setIsContactHovered(true);
	}

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
			<div className="max-w-2xl w-full space-y-8">
				{/* Render CMS content blocks */}
				{homePageContent.blocks
					.sort(function sortByOrder(a, b) {
						return a.order - b.order;
					})
					.map(function renderBlock(block) {
						const content = block.segments.map(renderSegment);

						if (block.blockType === "heading") {
							return (
								<h1
									key={block.id}
									className="text-xl font-medium text-foreground"
								>
									{content}
								</h1>
							);
						}

						return (
							<p
								key={block.id}
								className="text-foreground leading-relaxed text-base"
							>
								{content}
							</p>
						);
					})}

				{/* Contact form */}
				<p className="text-foreground leading-relaxed text-base">
					or contact me via{" "}
					<span
						className="relative inline-block"
						onMouseEnter={handleContactHover}
						onMouseLeave={function handleContactLeave() {
							setIsContactHovered(false);
						}}
					>
						<button className="text-accent font-medium border-b border-dotted border-accent/30 hover:border-accent/60">
							Email ↗
						</button>
						<ContactForm
							isVisible={isContactHovered}
							openAbove={shouldOpenAbove}
						/>
					</span>{" "}
					or check out my{" "}
					<a
						href="https://remcostoeten.nl"
						target="_blank"
						rel="noopener noreferrer"
						className="text-accent hover:underline font-medium"
					>
						website ↗
					</a>
					.
				</p>

				{/* Dynamic current time */}
				<p className="text-foreground leading-relaxed text-base">
					Right now it is{" "}
					<span
						className="font-medium font-mono"
						style={{ minWidth: "8ch", display: "inline-block" }}
					>
						{currentTime || "00:00:00"}
					</span>
					.
				</p>

				{/* Last commit information */}
				<div className="pt-4 border-t border-border/20">
					<LastCommit />
				</div>

				{/* GitHub Activity Demo */}
				<div className="pt-8 border-t border-border/20">
					<FyncGithubDemo />
				</div>
			</div>
		</div>
	);
}
