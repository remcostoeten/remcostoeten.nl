"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";
import {
	Palette,
	RotateCcw,
	Eye,
	AlertCircle,
	CheckCircle,
	Zap,
} from "lucide-react";

type TProps = {
	onColorChange?: (color: string) => void;
};

const presetColors = [
	{ name: "Lime Green", value: "85 100% 65%" },
	{ name: "Blue", value: "217 91% 60%" },
	{ name: "Purple", value: "263 70% 50%" },
	{ name: "Pink", value: "330 81% 60%" },
	{ name: "Orange", value: "25 95% 53%" },
	{ name: "Cyan", value: "188 100% 42%" },
	{ name: "Red", value: "0 72% 51%" },
	{ name: "Yellow", value: "48 100% 67%" },
	{ name: "Green", value: "142 76% 36%" },
	{ name: "Indigo", value: "239 84% 67%" },
];

export function AccentColorPicker({ onColorChange }: TProps) {
	const {
		accentColor,
		accentVariations,
		updateAccentColor,
		resetAccentColor,
		isLoading,
		setPreviewColor,
		getContrastRatio,
		isAccessible,
	} = useTheme();
	const [customColor, setCustomColor] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [showPreview, setShowPreview] = useState<boolean>(false);

	function parseHslFromInput(input: string) {
		const trimmed = input.trim();

		if (trimmed.includes("hsl(")) {
			const match = trimmed.match(/hsl\(([^)]+)\)/);
			if (match) {
				return match[1];
			}
		}

		if (trimmed.match(/^\d+\s+\d+%\s+\d+%$/)) {
			return trimmed;
		}

		return null;
	}

	function handlePreviewColor(color: string) {
		if (showPreview) {
			setPreviewColor(color);
		}
	}

	function handleStopPreview() {
		setPreviewColor(null);
		setShowPreview(false);
	}

	function togglePreviewMode() {
		setShowPreview(!showPreview);
		if (!showPreview) {
			setPreviewColor(null);
		}
	}

	function getAccessibilityInfo(color: string) {
		const contrast = getContrastRatio(color);
		const accessible = isAccessible(color);

		return {
			contrast: contrast.toFixed(2),
			accessible,
			rating: contrast >= 7 ? "AAA" : contrast >= 4.5 ? "AA" : "Fail",
		};
	}

	async function handlePresetColorClick(color: string) {
		try {
			setError("");
			await updateAccentColor(color);
			onColorChange?.(color);
		} catch (error) {
			setError("Failed to update accent color");
		}
	}

	async function handleCustomColorSubmit() {
		if (!customColor.trim()) {
			setError("Please enter a color value");
			return;
		}

		const parsedColor = parseHslFromInput(customColor);
		if (!parsedColor) {
			setError(
				"Invalid HSL format. Use: '85 100% 65%' or 'hsl(85, 100%, 65%)'",
			);
			return;
		}

		try {
			setError("");
			await updateAccentColor(parsedColor);
			onColorChange?.(parsedColor);
			setCustomColor("");
		} catch (error) {
			setError("Failed to update accent color");
		}
	}

	async function handleReset() {
		try {
			setError("");
			await resetAccentColor();
			onColorChange?.("85 100% 65%");
		} catch (error) {
			setError("Failed to reset accent color");
		}
	}

	const currentAccessibility = getAccessibilityInfo(accentColor);

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Palette className="w-5 h-5" />
						Accent Color Settings
					</div>
					<Button
						variant={showPreview ? "default" : "outline"}
						size="sm"
						onClick={togglePreviewMode}
						className="flex items-center gap-2"
					>
						<Eye className="w-4 h-4" />
						{showPreview ? "Exit Preview" : "Preview Mode"}
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label>Current Color</Label>
						<div className="flex items-center gap-2">
							<Badge
								variant={
									currentAccessibility.accessible ? "default" : "destructive"
								}
							>
								{currentAccessibility.accessible ? (
									<CheckCircle className="w-3 h-3 mr-1" />
								) : (
									<AlertCircle className="w-3 h-3 mr-1" />
								)}
								{currentAccessibility.rating}
							</Badge>
							<Badge variant="outline" className="text-xs">
								{currentAccessibility.contrast}:1
							</Badge>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div
							className="w-10 h-10 rounded-lg border border-border shadow-sm transition-all"
							style={{ backgroundColor: `hsl(${accentColor})` }}
						/>
						<div className="flex-1">
							<code className="text-sm font-mono bg-muted px-2 py-1 rounded block">
								{accentColor}
							</code>
							<div className="flex gap-1 mt-2">
								<div className="flex items-center gap-1">
									<div
										className="w-3 h-3 rounded-sm"
										style={{
											backgroundColor: `hsl(${accentVariations.hover})`,
										}}
									/>
									<span className="text-xs text-muted-foreground">Hover</span>
								</div>
								<div className="flex items-center gap-1">
									<div
										className="w-3 h-3 rounded-sm"
										style={{
											backgroundColor: `hsl(${accentVariations.active})`,
										}}
									/>
									<span className="text-xs text-muted-foreground">Active</span>
								</div>
								<div className="flex items-center gap-1">
									<div
										className="w-3 h-3 rounded-sm"
										style={{
											backgroundColor: `hsl(${accentVariations.muted})`,
										}}
									/>
									<span className="text-xs text-muted-foreground">Muted</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-3">
					<Label>Preset Colors</Label>
					<div className="grid grid-cols-5 gap-2">
						{presetColors.map((preset) => {
							const presetAccessibility = getAccessibilityInfo(preset.value);
							return (
								<Button
									key={preset.name}
									variant={accentColor === preset.value ? "default" : "outline"}
									size="sm"
									className="p-2 h-auto relative group"
									onClick={() => handlePresetColorClick(preset.value)}
									onMouseEnter={() => handlePreviewColor(preset.value)}
									onMouseLeave={() => showPreview && setPreviewColor(null)}
									disabled={isLoading}
									title={`${preset.name} - ${presetAccessibility.rating} (${presetAccessibility.contrast}:1)`}
								>
									<div className="flex flex-col items-center gap-1">
										<div
											className="w-6 h-6 rounded border border-border transition-all"
											style={{ backgroundColor: `hsl(${preset.value})` }}
										/>
										<div className="flex items-center gap-1">
											{presetAccessibility.accessible ? (
												<CheckCircle className="w-2 h-2 text-green-500" />
											) : (
												<AlertCircle className="w-2 h-2 text-orange-500" />
											)}
											<span className="text-xs">
												{presetAccessibility.rating}
											</span>
										</div>
									</div>
								</Button>
							);
						})}
					</div>
				</div>

				<div className="space-y-3">
					<Label htmlFor="custom-color">Custom HSL Color</Label>
					<div className="flex gap-2">
						<Input
							id="custom-color"
							placeholder="85 100% 65%"
							value={customColor}
							onChange={(e) => {
								setCustomColor(e.target.value);
								const parsed = parseHslFromInput(e.target.value);
								if (parsed && showPreview) {
									handlePreviewColor(parsed);
								}
							}}
							onKeyDown={(e) => e.key === "Enter" && handleCustomColorSubmit()}
							disabled={isLoading}
						/>
						<Button
							onClick={handleCustomColorSubmit}
							disabled={isLoading || !customColor.trim()}
						>
							<Zap className="w-4 h-4" />
						</Button>
					</div>
					<p className="text-xs text-muted-foreground">
						Use HSL format: "85 100% 65%" or "hsl(85, 100%, 65%)"
					</p>
					{customColor && (
						<div className="flex items-center gap-2 text-xs">
							<div
								className="w-4 h-4 rounded border"
								style={{
									backgroundColor: parseHslFromInput(customColor)
										? `hsl(${parseHslFromInput(customColor)})`
										: "transparent",
								}}
							/>
							{parseHslFromInput(customColor) && (
								<>
									<Badge variant="outline" className="text-xs">
										{
											getAccessibilityInfo(parseHslFromInput(customColor)!)
												.contrast
										}
										:1
									</Badge>
									<Badge
										variant={
											getAccessibilityInfo(parseHslFromInput(customColor)!)
												.accessible
												? "default"
												: "destructive"
										}
									>
										{
											getAccessibilityInfo(parseHslFromInput(customColor)!)
												.rating
										}
									</Badge>
								</>
							)}
						</div>
					)}
				</div>

				{showPreview && (
					<div className="bg-muted/50 p-3 rounded-lg border border-accent/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Eye className="w-4 h-4 text-accent" />
								<span className="text-sm font-medium">Preview Mode Active</span>
							</div>
							<Button variant="ghost" size="sm" onClick={handleStopPreview}>
								Stop Preview
							</Button>
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							Hover over colors to see live preview effects across your site
						</p>
					</div>
				)}

				{error && (
					<div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
						<p className="text-sm text-destructive flex items-center gap-2">
							<AlertCircle className="w-4 h-4" />
							{error}
						</p>
					</div>
				)}

				<div className="flex justify-between pt-4 border-t">
					<Button
						variant="outline"
						size="sm"
						onClick={handleReset}
						disabled={isLoading}
						className="flex items-center gap-2"
					>
						<RotateCcw className="w-4 h-4" />
						Reset to Default
					</Button>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Zap className="w-4 h-4" />
						Developer Experience Enhanced
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
