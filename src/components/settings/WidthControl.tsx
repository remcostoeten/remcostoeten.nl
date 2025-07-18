"use client";

import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Monitor, Tablet, Smartphone, Save, RotateCcw } from "lucide-react";

type TWidthUnit = "px" | "vw" | "%";

type TWidthValue = {
	value: number;
	unit: TWidthUnit;
};

type TProps = {
	initialWidth?: TWidthValue;
	pageId?: number;
	global?: boolean;
	onWidthChange?: (width: TWidthValue) => void;
};

const PRESET_WIDTHS = {
	mobile: { value: 375, unit: "px" as TWidthUnit },
	tablet: { value: 768, unit: "px" as TWidthUnit },
	desktop: { value: 1200, unit: "px" as TWidthUnit },
	wide: { value: 1920, unit: "px" as TWidthUnit },
	fluid25: { value: 25, unit: "vw" as TWidthUnit },
	fluid50: { value: 50, unit: "vw" as TWidthUnit },
	fluid75: { value: 75, unit: "vw" as TWidthUnit },
	fluid100: { value: 100, unit: "vw" as TWidthUnit },
};

const DEFAULT_WIDTH: TWidthValue = { value: 672, unit: "px" }; // Current max-w-2xl equivalent

export default function WidthControl({
	initialWidth = DEFAULT_WIDTH,
	pageId,
	global = false,
	onWidthChange,
}: TProps) {
	const [width, setWidth] = useState(initialWidth);
	const [inputWidth, setInputWidth] = useState(initialWidth.value.toString());
	const [selectedUnit, setSelectedUnit] = useState<TWidthUnit>(
		initialWidth.unit,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		setWidth(initialWidth);
		setInputWidth(initialWidth.value.toString());
		setSelectedUnit(initialWidth.unit);
	}, [initialWidth]);

	const handleSliderChange = useCallback(
		(value: number[]) => {
			const newValue = value[0];
			const newWidth = { value: newValue, unit: selectedUnit };
			setWidth(newWidth);
			setInputWidth(newValue.toString());
			setHasUnsavedChanges(
				newValue !== initialWidth.value || selectedUnit !== initialWidth.unit,
			);
			onWidthChange?.(newWidth);
		},
		[initialWidth, selectedUnit, onWidthChange],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setInputWidth(value);

			const numericValue = parseFloat(value);
			const minValue = selectedUnit === "px" ? 300 : 1;
			const maxValue = selectedUnit === "px" ? 1920 : 100;

			if (
				!isNaN(numericValue) &&
				numericValue >= minValue &&
				numericValue <= maxValue
			) {
				const newWidth = { value: numericValue, unit: selectedUnit };
				setWidth(newWidth);
				setHasUnsavedChanges(
					numericValue !== initialWidth.value ||
						selectedUnit !== initialWidth.unit,
				);
				onWidthChange?.(newWidth);
			}
		},
		[initialWidth, selectedUnit, onWidthChange],
	);

	const handlePresetClick = useCallback(
		(presetWidth: TWidthValue) => {
			setWidth(presetWidth);
			setInputWidth(presetWidth.value.toString());
			setSelectedUnit(presetWidth.unit);
			setHasUnsavedChanges(
				presetWidth.value !== initialWidth.value ||
					presetWidth.unit !== initialWidth.unit,
			);
			onWidthChange?.(presetWidth);
		},
		[initialWidth, onWidthChange],
	);

	const handleUnitChange = useCallback(
		(newUnit: TWidthUnit) => {
			setSelectedUnit(newUnit);

			// Convert values when switching units
			let newValue = width.value;
			if (width.unit === "px" && (newUnit === "vw" || newUnit === "%")) {
				// Convert px to approximate vw (assuming 1920px = 100vw)
				newValue = Math.round((width.value / 1920) * 100);
			} else if (
				(width.unit === "vw" || width.unit === "%") &&
				newUnit === "px"
			) {
				// Convert vw/% to approximate px
				newValue = Math.round((width.value / 100) * 1920);
			}

			const newWidth = { value: newValue, unit: newUnit };
			setWidth(newWidth);
			setInputWidth(newValue.toString());
			setHasUnsavedChanges(
				newValue !== initialWidth.value || newUnit !== initialWidth.unit,
			);
			onWidthChange?.(newWidth);
		},
		[width, initialWidth, onWidthChange],
	);

	const handleSave = async () => {
		if (!pageId && !global) {
			toast({
				title: "Error",
				description: "Page ID is required for saving settings",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/layout-settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					pageId: global ? undefined : pageId,
					settingKey: "containerWidth",
					settingValue: JSON.stringify(width),
					settingType: "json",
					description: "Container width setting for content layout",
					global,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save width setting");
			}

			const result = await response.json();

			if (result.success) {
				toast({
					title: "Success",
					description: `Container width saved: ${width.value}${width.unit}`,
				});
				setHasUnsavedChanges(false);
			} else {
				throw new Error(result.error || "Failed to save setting");
			}
		} catch (error) {
			console.error("Error saving width setting:", error);
			toast({
				title: "Error",
				description: "Failed to save width setting",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setWidth(initialWidth);
		setInputWidth(initialWidth.value.toString());
		setSelectedUnit(initialWidth.unit);
		setHasUnsavedChanges(false);
		onWidthChange?.(initialWidth);
	};

	const getSliderConfig = () => {
		switch (selectedUnit) {
			case "px":
				return { min: 300, max: 1920, step: 10 };
			case "vw":
			case "%":
				return { min: 1, max: 100, step: 1 };
			default:
				return { min: 1, max: 100, step: 1 };
		}
	};

	const sliderConfig = getSliderConfig();

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Monitor className="w-5 h-5" />
					Container Width
				</CardTitle>
				<CardDescription>
					Adjust the maximum width of your content container. Changes are
					applied instantly but need to be saved.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Unit Switcher */}
				<div className="space-y-2">
					<Label className="text-sm font-medium">Unit</Label>
					<div className="flex gap-2">
						<Button
							variant={selectedUnit === "px" ? "default" : "outline"}
							size="sm"
							onClick={() => handleUnitChange("px")}
						>
							Pixels (px)
						</Button>
						<Button
							variant={selectedUnit === "vw" ? "default" : "outline"}
							size="sm"
							onClick={() => handleUnitChange("vw")}
						>
							Viewport Width (vw)
						</Button>
						<Button
							variant={selectedUnit === "%" ? "default" : "outline"}
							size="sm"
							onClick={() => handleUnitChange("%")}
						>
							Percentage (%)
						</Button>
					</div>
				</div>

				{/* Preset Buttons */}
				<div className="space-y-2">
					<Label className="text-sm font-medium">Quick Presets</Label>
					<div className="grid grid-cols-4 gap-2 mb-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.mobile)}
							className="flex items-center gap-2"
						>
							<Smartphone className="w-4 h-4" />
							Mobile
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.tablet)}
							className="flex items-center gap-2"
						>
							<Tablet className="w-4 h-4" />
							Tablet
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.desktop)}
							className="flex items-center gap-2"
						>
							<Monitor className="w-4 h-4" />
							Desktop
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.wide)}
							className="flex items-center gap-2"
						>
							<Monitor className="w-4 h-4" />
							Wide
						</Button>
					</div>
					<div className="grid grid-cols-4 gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.fluid25)}
							className="flex items-center gap-2"
						>
							25vw
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.fluid50)}
							className="flex items-center gap-2"
						>
							50vw
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.fluid75)}
							className="flex items-center gap-2"
						>
							75vw
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePresetClick(PRESET_WIDTHS.fluid100)}
							className="flex items-center gap-2"
						>
							100vw
						</Button>
					</div>
				</div>

				{/* Slider Control */}
				<div className="space-y-2">
					<Label className="text-sm font-medium">
						Width: {width.value}
						{width.unit}
					</Label>
					<Slider
						value={[width.value]}
						onValueChange={handleSliderChange}
						min={sliderConfig.min}
						max={sliderConfig.max}
						step={sliderConfig.step}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>
							{sliderConfig.min}
							{selectedUnit}
						</span>
						<span>
							{sliderConfig.max}
							{selectedUnit}
						</span>
					</div>
				</div>

				{/* Input Control */}
				<div className="space-y-2">
					<Label htmlFor="width-input" className="text-sm font-medium">
						Exact Width ({selectedUnit})
					</Label>
					<div className="flex gap-2">
						<Input
							id="width-input"
							type="number"
							min={sliderConfig.min}
							max={sliderConfig.max}
							step={sliderConfig.step}
							value={inputWidth}
							onChange={handleInputChange}
							className="flex-1"
							placeholder={`Enter width in ${selectedUnit}`}
						/>
						<span className="flex items-center px-3 text-sm text-muted-foreground bg-muted rounded">
							{selectedUnit}
						</span>
					</div>
				</div>

				{/* Visual Preview */}
				<div className="space-y-2">
					<Label className="text-sm font-medium">Preview</Label>
					<div className="w-full bg-muted rounded p-4 overflow-hidden">
						<div className="w-full">
							<div
								className="bg-background border border-border rounded h-12 transition-all duration-200 mx-auto"
								style={{
									width: `${width.value}${width.unit}`,
									maxWidth: "100%",
								}}
							>
								<div className="p-3 text-xs text-muted-foreground text-center">
									{width.value}{width.unit} container
								</div>
							</div>
							<div className="mt-2 text-xs text-muted-foreground text-center">
								Scale: {selectedUnit === "px" ? `${Math.round((width.value / 400) * 100)}%` : `${width.value}${width.unit}`} of preview area
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-between items-center pt-4 border-t">
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
							disabled={!hasUnsavedChanges}
						>
							<RotateCcw className="w-4 h-4 mr-1" />
							Reset
						</Button>
					</div>
					<Button
						onClick={handleSave}
						disabled={!hasUnsavedChanges || isLoading}
						size="sm"
					>
						<Save className="w-4 h-4 mr-1" />
						{isLoading ? "Saving..." : "Save Width"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
