"use client";

import { useState } from "react";
import { Plus, X, Settings, Move } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useContactPopover } from "@/hooks/useContactPopover";

type TWidgetType =
	| "feedback-form"
	| "contact-form"
	| "time-display"
	| "custom-text";

type TWidget = {
	id: string;
	type: TWidgetType;
	title: string;
	content?: string;
	position: {
		x: number;
		y: number;
	};
	zIndex: number;
	isActive: boolean;
	isDragging: boolean;
	config?: Record<string, any>;
};

type TDropZone = {
	id: string;
	name: string;
	position: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	acceptedTypes: TWidgetType[];
	isActive: boolean;
	widgets: TWidget[];
};

type TProps = {
	onWidgetUpdate?: (widgets: TWidget[]) => void;
	onZoneUpdate?: (zones: TDropZone[]) => void;
	initialWidgets?: TWidget[];
	initialZones?: TDropZone[];
};

export default function DragDropWidgetManager({
	onWidgetUpdate,
	initialWidgets = [],
	initialZones = [],
}: TProps) {
	const [widgets, setWidgets] = useState<TWidget[]>(initialWidgets);
	const [dropZones, setDropZones] = useState<TDropZone[]>(initialZones);
	const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
	const [isDragMode, setIsDragMode] = useState(false);
	const [hoverZone, setHoverZone] = useState<string | null>(null);
	const [showWidgetPalette, setShowWidgetPalette] = useState(false);

	const {
		isVisible: contactFormVisible,
		shouldOpenAbove,
		handleMouseEnter: handleContactMouseEnter,
		handleMouseLeave: handleContactMouseLeave,
		handlePopoverMouseEnter,
		handlePopoverMouseLeave,
		popoverRootRef,
	} = useContactPopover();

	const widgetTemplates: Record<TWidgetType, Partial<TWidget>> = {
		"feedback-form": {
			type: "feedback-form",
			title: "Feedback Form",
			content: "Quick feedback form for user input",
			config: {
				placeholder: "Share your thoughts...",
				submitText: "Send Feedback",
				showEmoji: true,
			},
		},
		"contact-form": {
			type: "contact-form",
			title: "Contact Form",
			content: "Contact form with hover activation",
			config: {
				triggerText: "Get in touch",
				hoverDelay: 300,
			},
		},
		"time-display": {
			type: "time-display",
			title: "Time Display",
			content: "Current time widget",
			config: {
				timezone: "UTC+1",
				format: "24h",
				showSeconds: true,
			},
		},
		"custom-text": {
			type: "custom-text",
			title: "Custom Text",
			content: "Editable text widget",
			config: {
				text: "Click to edit...",
				fontSize: "16px",
				fontWeight: "normal",
			},
		},
	};

	function createWidget(
		type: TWidgetType,
		position: { x: number; y: number },
	): TWidget {
		const template = widgetTemplates[type];
		return {
			id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type,
			title: template.title || "Widget",
			content: template.content || "",
			position,
			zIndex: Date.now(),
			isActive: false,
			isDragging: false,
			config: template.config || {},
		};
	}

	function addWidget(type: TWidgetType, position?: { x: number; y: number }) {
		const newWidget = createWidget(type, position || { x: 100, y: 100 });
		setWidgets((prev) => [...prev, newWidget]);
		onWidgetUpdate?.([...widgets, newWidget]);
	}

	function removeWidget(id: string) {
		setWidgets((prev) => prev.filter((w) => w.id !== id));
		onWidgetUpdate?.(widgets.filter((w) => w.id !== id));
	}

	function updateWidget(id: string, updates: Partial<TWidget>) {
		setWidgets((prev) =>
			prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
		);
		onWidgetUpdate?.(
			widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
		);
	}

	function handleDragStart(e: React.DragEvent, widget: TWidget) {
		e.dataTransfer.setData("application/json", JSON.stringify(widget));
		updateWidget(widget.id, { isDragging: true });
		setIsDragMode(true);
	}

	function handleDragEnd(_e: React.DragEvent, widget: TWidget) {
		updateWidget(widget.id, { isDragging: false });
		setIsDragMode(false);
	}

	function handleDrop(e: React.DragEvent, zoneId?: string) {
		e.preventDefault();
		const widgetData = JSON.parse(e.dataTransfer.getData("application/json"));
		const rect = e.currentTarget.getBoundingClientRect();
		const position = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};

		if (zoneId) {
			// Handle drop in specific zone
			const zone = dropZones.find((z) => z.id === zoneId);
			if (zone && zone.acceptedTypes.includes(widgetData.type)) {
				updateWidget(widgetData.id, { position });
				setDropZones((prev) =>
					prev.map((z) =>
						z.id === zoneId ? { ...z, widgets: [...z.widgets, widgetData] } : z,
					),
				);
			}
		} else {
			// Handle drop in general area
			updateWidget(widgetData.id, { position });
		}
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
	}

	function handleHoverAssignment(zoneId: string, widgetType: TWidgetType) {
		const zone = dropZones.find((z) => z.id === zoneId);
		if (zone && zone.acceptedTypes.includes(widgetType)) {
			const newWidget = createWidget(widgetType, zone.position);
			setWidgets((prev) => [...prev, newWidget]);

			// Set up hover activation for the widget
			if (widgetType === "feedback-form" || widgetType === "contact-form") {
				updateWidget(newWidget.id, {
					config: {
						...newWidget.config,
						hoverActivated: true,
						hoverZone: zoneId,
					},
				});
			}
		}
	}

	function renderWidget(widget: TWidget) {
		const isSelected = selectedWidget === widget.id;
		const baseClasses = `absolute cursor-move border-2 transition-all duration-200 ${
			isSelected
				? "border-accent shadow-lg"
				: "border-transparent hover:border-accent/50"
		} ${widget.isDragging ? "opacity-50" : ""}`;

		switch (widget.type) {
			case "feedback-form":
			case "contact-form":
				return (
					<div
						key={widget.id}
						className={`${baseClasses} bg-card rounded-lg p-4 min-w-[200px]`}
						style={{
							left: widget.position.x,
							top: widget.position.y,
							zIndex: widget.zIndex,
						}}
						draggable
						onDragStart={(e) => handleDragStart(e, widget)}
						onDragEnd={(e) => handleDragEnd(e, widget)}
						onClick={() => setSelectedWidget(widget.id)}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">{widget.title}</span>
							<div className="flex gap-1">
								<Button
									size="sm"
									variant="ghost"
									onClick={(e) => {
										e.stopPropagation();
										// Open widget settings
									}}
								>
									<Settings className="w-3 h-3" />
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={(e) => {
										e.stopPropagation();
										removeWidget(widget.id);
									}}
								>
									<X className="w-3 h-3" />
								</Button>
							</div>
						</div>
						{widget.config?.hoverActivated ? (
							<div
								ref={popoverRootRef as React.RefObject<HTMLDivElement>}
								onMouseEnter={handleContactMouseEnter}
								onMouseLeave={handleContactMouseLeave}
								className="relative"
							>
								<span className="text-accent cursor-pointer border-b border-dotted border-accent/30 hover:border-accent/60">
									{widget.config?.triggerText || "Hover me"}
								</span>
								<ContactForm
									isVisible={contactFormVisible}
									openAbove={shouldOpenAbove}
									containerRef={
										popoverRootRef as React.RefObject<HTMLDivElement>
									}
									onMouseEnter={handlePopoverMouseEnter}
									onMouseLeave={handlePopoverMouseLeave}
								/>
							</div>
						) : (
							<div className="text-sm text-muted-foreground">
								{widget.content}
							</div>
						)}
					</div>
				);

			case "time-display":
				return (
					<div
						key={widget.id}
						className={`${baseClasses} bg-card rounded-lg p-4 min-w-[150px]`}
						style={{
							left: widget.position.x,
							top: widget.position.y,
							zIndex: widget.zIndex,
						}}
						draggable
						onDragStart={(e) => handleDragStart(e, widget)}
						onDragEnd={(e) => handleDragEnd(e, widget)}
						onClick={() => setSelectedWidget(widget.id)}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">{widget.title}</span>
							<Button
								size="sm"
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									removeWidget(widget.id);
								}}
							>
								<X className="w-3 h-3" />
							</Button>
						</div>
						<div className="text-lg font-mono">
							{new Date().toLocaleTimeString([], {
								hour12: widget.config?.format === "12h",
								hour: "2-digit",
								minute: "2-digit",
								second: widget.config?.showSeconds ? "2-digit" : undefined,
							})}
						</div>
					</div>
				);

			case "custom-text":
				return (
					<div
						key={widget.id}
						className={`${baseClasses} bg-card rounded-lg p-4 min-w-[200px]`}
						style={{
							left: widget.position.x,
							top: widget.position.y,
							zIndex: widget.zIndex,
						}}
						draggable
						onDragStart={(e) => handleDragStart(e, widget)}
						onDragEnd={(e) => handleDragEnd(e, widget)}
						onClick={() => setSelectedWidget(widget.id)}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">{widget.title}</span>
							<Button
								size="sm"
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									removeWidget(widget.id);
								}}
							>
								<X className="w-3 h-3" />
							</Button>
						</div>
						<div
							className="text-sm"
							style={{
								fontSize: widget.config?.fontSize || "16px",
								fontWeight: widget.config?.fontWeight || "normal",
							}}
						>
							{widget.config?.text || widget.content}
						</div>
					</div>
				);

			default:
				return null;
		}
	}

	function renderDropZone(zone: TDropZone) {
		const isActive = hoverZone === zone.id;

		return (
			<div
				key={zone.id}
				className={`absolute border-2 border-dashed transition-all duration-200 ${
					isActive
						? "border-accent bg-accent/10"
						: "border-muted-foreground/30 hover:border-accent/50"
				}`}
				style={{
					left: zone.position.x,
					top: zone.position.y,
					width: zone.position.width,
					height: zone.position.height,
				}}
				onDrop={(e) => handleDrop(e, zone.id)}
				onDragOver={handleDragOver}
				onMouseEnter={() => setHoverZone(zone.id)}
				onMouseLeave={() => setHoverZone(null)}
			>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
						{zone.name}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full">
			{/* Widget Palette */}
			{showWidgetPalette && (
				<Card className="absolute top-4 right-4 z-50 w-64">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<span className="font-medium">Widget Palette</span>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setShowWidgetPalette(false)}
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						{Object.entries(widgetTemplates).map(([type, template]) => (
							<Button
								key={type}
								variant="outline"
								className="w-full justify-start"
								onClick={() => addWidget(type as TWidgetType)}
							>
								<Plus className="w-4 h-4 mr-2" />
								{template.title}
							</Button>
						))}
					</CardContent>
				</Card>
			)}

			{/* Controls */}
			<div className="absolute top-4 left-4 z-50 flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowWidgetPalette(true)}
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Widget
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsDragMode(!isDragMode)}
				>
					<Move className="w-4 h-4 mr-2" />
					{isDragMode ? "Exit Drag Mode" : "Drag Mode"}
				</Button>
			</div>

			{/* Drop Zones */}
			{dropZones.map(renderDropZone)}

			{/* Widgets */}
			{widgets.map(renderWidget)}

			{/* Hover Assignment Panel */}
			{hoverZone && (
				<div className="absolute bottom-4 left-4 z-50 bg-card border border-border rounded-lg p-4 min-w-[200px]">
					<div className="text-sm font-medium mb-2">
						Assign to {dropZones.find((z) => z.id === hoverZone)?.name}
					</div>
					<div className="space-y-1">
						{dropZones
							.find((z) => z.id === hoverZone)
							?.acceptedTypes.map((type) => (
								<Button
									key={type}
									variant="ghost"
									size="sm"
									className="w-full justify-start"
									onClick={() => handleHoverAssignment(hoverZone, type)}
								>
									{widgetTemplates[type].title}
								</Button>
							))}
					</div>
				</div>
			)}
		</div>
	);
}
