"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";
import { Code, Palette, Link, Zap } from "lucide-react";

export function ThemeDemo() {
	const { accentColor, accentVariations } = useTheme();

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Palette className="w-5 h-5" />
					Live Theme Preview
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-3">
						<h3 className="font-semibold text-sm">Interactive Elements</h3>
						<div className="space-y-2">
							<Button className="w-full bg-accent hover:bg-accent-hover text-accent-foreground">
								Primary Button
							</Button>
							<Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
								Outline Button
							</Button>
							<Button variant="ghost" className="w-full text-accent hover:bg-accent/20">
								Ghost Button
							</Button>
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-semibold text-sm">Content Elements</h3>
						<div className="space-y-2">
							<Badge className="bg-accent text-accent-foreground">
								<Zap className="w-3 h-3 mr-1" />
								Accent Badge
							</Badge>
							<div className="text-sm">
								This is a <span className="text-accent font-medium">highlighted link</span> in content
							</div>
							<div className="text-sm">
								I'm a <span className="text-highlight-frontend font-medium">Frontend Developer</span> working on 
								<span className="text-highlight-product font-medium"> digital products</span>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-3">
					<h3 className="font-semibold text-sm">Developer Info</h3>
					<div className="bg-muted/50 p-4 rounded-lg space-y-2">
						<div className="flex items-center gap-2 text-sm">
							<Code className="w-4 h-4" />
							<span>CSS Variables Updated:</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-xs font-mono">
							<div>--accent: <span className="text-accent">{accentColor}</span></div>
							<div>--accent-hover: <span className="text-accent">{accentVariations.hover}</span></div>
							<div>--accent-active: <span className="text-accent">{accentVariations.active}</span></div>
							<div>--accent-muted: <span className="text-accent">{accentVariations.muted}</span></div>
						</div>
					</div>
				</div>

				<div className="space-y-3">
					<h3 className="font-semibold text-sm">Frontend Effects</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Link className="w-4 h-4 text-accent" />
								Navigation
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								All navigation links use the accent color
							</p>
						</div>
						<div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Zap className="w-4 h-4 text-accent" />
								Interactive
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Buttons, links, and hover states
							</p>
						</div>
						<div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Palette className="w-4 h-4 text-accent" />
								Highlights
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Text highlights and emphasis
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
