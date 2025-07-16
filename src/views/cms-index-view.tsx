"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { useContactPopover } from "@/hooks/useContactPopover";
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
	const [currentTime, setCurrentTime] = useState<string>("");
	const {
		isVisible,
		shouldOpenAbove,
		handleMouseEnter,
		handleMouseLeave,
		handleClick,
		handlePopoverMouseEnter,
		handlePopoverMouseLeave,
		popoverRootRef,
	} = useContactPopover();
	const [homePageContent] = useState<TPageContent>(initialContent);

	useEffect(function initTime() {
		setCurrentTime(getFormattedTime());
	}, []);

	useEffect(function setupTimeInterval() {
		function updateTime() {
			setCurrentTime(getFormattedTime());
		}

		const interval = setInterval(updateTime, 600);
		return function cleanup() {
			clearInterval(interval);
		};
	}, []);

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
			<div className="max-w-2xl w-full space-y-8">
				{homePageContent.blocks
					.sort(function sortByOrder(a, b) {
						return a.order - b.order;
					})
					.map(function renderBlock(block) {
						const content = block.segments.map((segment) => {
							// Handle contact form segment specially
							if (segment.type === 'contact-form') {
								return (
									<div key={segment.id} className="relative">
										<p className="text-foreground leading-relaxed text-base">
											{segment.content || 'or contact me via'}{" "}
											<span
												className="relative inline-block"
												ref={popoverRootRef}
												onMouseEnter={handleMouseEnter}
												onMouseLeave={handleMouseLeave}
											>
												<button
													className="text-accent font-medium border-b border-dotted border-accent/30 hover:border-accent/60"
													onClick={handleClick}
												>
													{segment.data?.emailText || 'Email ↗'}
												</button>
											</span>{" "}
											{segment.data?.additionalText || 'or check out my'}{" "}
											<a
												href={segment.data?.websiteUrl || 'https://remcostoeten.nl'}
												target="_blank"
												rel="noopener noreferrer"
												className="text-accent hover:underline font-medium"
											>
												{segment.data?.websiteText || 'website ↗'}
											</a>
											.
										</p>
										<ContactForm
											isVisible={isVisible}
											openAbove={shouldOpenAbove}
											containerRef={popoverRootRef}
											onMouseEnter={handlePopoverMouseEnter}
											onMouseLeave={handlePopoverMouseLeave}
										/>
									</div>
								);
							}
							
							// Handle time display segment specially
							if (segment.type === 'time-display') {
								return (
									<span key={segment.id}>
										{segment.content || 'Right now it is'}{" "}
										<span
											className="font-medium font-mono"
											style={{ minWidth: "8ch", display: "inline-block" }}
										>
											{currentTime || "--:--"}
										</span>
										.
									</span>
								);
							}
							
							return renderSegment(segment);
						});

						const blockStyles = {
							marginTop: block.styles?.marginTop || undefined,
							marginBottom: block.styles?.marginBottom || undefined,
							paddingTop: block.styles?.paddingTop || undefined,
							paddingBottom: block.styles?.paddingBottom || undefined,
						};

						let borderClasses = "";
						if (block.styles?.borderTop) borderClasses += " border-t border-border";
						if (block.styles?.borderBottom) borderClasses += " border-b border-border";
						if (block.styles?.borderLeft) borderClasses += " border-l border-border";
						if (block.styles?.borderRight) borderClasses += " border-r border-border";

						if (block.blockType === "heading") {
							return (
								<h1
									key={block.id}
									className={`text-xl font-medium text-foreground${borderClasses}`}
									style={blockStyles}
								>
									{content}
								</h1>
							);
						}

						const hasProjectCard = block.segments.some(function (segment) {
							return segment.type === "project-card";
						});

						if (hasProjectCard) {
							return (
								<div
									key={block.id}
									className={`text-foreground leading-relaxed text-base${borderClasses}`}
									style={blockStyles}
								>
									{content}
								</div>
							);
						}

						return (
							<p
								key={block.id}
								className={`text-foreground leading-relaxed text-base${borderClasses}`}
								style={blockStyles}
							>
								{content}
							</p>
					});
					})}
			</div>
		</div>
	);
}
