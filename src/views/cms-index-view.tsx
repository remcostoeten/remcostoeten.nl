"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { useContactPopover } from "@/hooks/useContactPopover";
import { useContainerWidth } from "@/hooks/useLayoutSettings";
import { renderSegment } from "@/lib/cms/renderSegment";
import { TPageContent } from "@/lib/cms/types";

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
	const [isClient, setIsClient] = useState(false);
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
	const { containerWidth } = useContainerWidth(undefined, true); // Use global setting

	useEffect(function initClient() {
		setIsClient(true);
		setCurrentTime(getFormattedTime());
	}, []);

	useEffect(
		function setupTimeInterval() {
			if (!isClient) return;

			function updateTime() {
				setCurrentTime(getFormattedTime());
			}

			const interval = setInterval(updateTime, 600);
			return function cleanup() {
				clearInterval(interval);
			};
		},
		[isClient],
	);

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
			<div
				className="w-full space-y-8"
				style={{ maxWidth: `${containerWidth.value}${containerWidth.unit}` }}
			>
				{homePageContent.blocks
					.sort(function sortByOrder(a, b) {
						return (a.order || 0) - (b.order || 0);
					})
					.map(function renderBlock(block) {
						const content = block.segments.map((segment) => {
							// Handle contact form segment specially
							if (segment.type === "text" && segment.metadata) {
								try {
									const segmentData = JSON.parse(segment.metadata);
									if (
										segmentData.emailText ||
										segmentData.additionalText ||
										segmentData.websiteUrl
									) {
										return (
											<div key={segment.id} className="relative">
												<p className="text-foreground leading-relaxed text-base">
													{segment.content || "or contact me via"}{" "}
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
															{segmentData.emailText || "Email ↗"}
														</button>
													</span>{" "}
													{segmentData.additionalText || "or check out my"}{" "}
													<a
														href={
															segmentData.websiteUrl ||
															"https://remcostoeten.nl"
														}
														target="_blank"
														rel="noopener noreferrer"
														className="text-accent hover:underline font-medium"
													>
														{segmentData.websiteText || "website ↗"}
													</a>
													.
												</p>
												<ContactForm
													isVisible={isVisible}
													openAbove={shouldOpenAbove}
													containerRef={
														popoverRootRef as React.RefObject<HTMLDivElement>
													}
													onMouseEnter={handlePopoverMouseEnter}
													onMouseLeave={handlePopoverMouseLeave}
												/>
											</div>
										);
									}
								} catch (error) {
									// If metadata parsing fails, fall through to normal rendering
								}
							}

							// Handle time display segment specially
							if (segment.type === "time-widget") {
								return (
									<span key={segment.id}>
										{"Right now it is"}{" "}
										<span
											className="font-medium font-mono"
											style={{ minWidth: "8ch", display: "inline-block" }}
										>
											{isClient ? currentTime || "--:--" : "--:--"}
										</span>
										.
									</span>
								);
							}

							const segmentForRender = segment as any;
							return renderSegment({
								id: segment.id.toString(),
								type: segment.type as any,
								content: segmentForRender.content || "",
								href: segment.href || undefined,
								target: segment.target || undefined,
								metadata: segment.metadata || undefined,
								value: segmentForRender.value || undefined,
								className: segment.className || undefined,
							});
						});

						const blockStyles = {
							marginTop: (block as any).styles?.marginTop || undefined,
							marginBottom: (block as any).styles?.marginBottom || undefined,
							paddingTop: (block as any).styles?.paddingTop || undefined,
							paddingBottom: (block as any).styles?.paddingBottom || undefined,
						};

						let borderClasses = "";
						if ((block as any).styles?.borderTop)
							borderClasses += " border-t border-border";
						if ((block as any).styles?.borderBottom)
							borderClasses += " border-b border-border";
						if ((block as any).styles?.borderLeft)
							borderClasses += " border-l border-border";
						if ((block as any).styles?.borderRight)
							borderClasses += " border-r border-border";

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
							return (segment as any).type === "project-card";
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
						);
					})}
			</div>
		</div>
	);
}
