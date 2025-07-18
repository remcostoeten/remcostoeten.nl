"use client";
import { useEffect, useState } from "react";
import { TextSkeleton } from "@/components/ui/text-skeleton";
import type { TTimeWidgetConfig } from "@/lib/cms/types";

// Move these outside the component since they don't use any component state/props
function formatTime(
	date: Date,
	timezone: string,
	format: "12h" | "24h",
	showSeconds: boolean,
): string {
	const options: Intl.DateTimeFormatOptions = {
		timeZone: timezone,
		hour: "numeric",
		minute: "2-digit",
		hour12: format === "12h",
	};
	if (showSeconds) {
		options.second = "2-digit";
	}
	return new Intl.DateTimeFormat("en-US", options).format(date);
}

function getPlaceholderTime(format: "12h" | "24h", showSeconds: boolean): string {
	if (format === "12h") {
		return showSeconds ? "12:00:00 AM" : "12:00 AM";
	}
	return showSeconds ? "00:00:00" : "00:00";
}

function formatTimeForDatetime(
	date: Date,
	timezone: string,
	showSeconds: boolean,
): string {
	const options: Intl.DateTimeFormatOptions = {
		timeZone: timezone,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};
	if (showSeconds) {
		options.second = "2-digit";
	}
	return new Intl.DateTimeFormat("sv-SE", options).format(date);
}

type TProps = {
	config: TTimeWidgetConfig;
};

export function TimeWidget({ config }: TProps) {
	const [currentTime, setCurrentTime] = useState<string | null>(null);
	const [currentDate, setCurrentDate] = useState<Date | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		function updateTime() {
			const now = new Date();
			const formattedTime = formatTime(
				now,
				config.timezone,
				config.format,
				config.showSeconds,
			);
			setCurrentTime(formattedTime);
			setCurrentDate(now);
			setIsLoading(false);
		}

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, [config.timezone, config.format, config.showSeconds]);

	const displayLabel = config.label || config.timezone;
	const placeholder = getPlaceholderTime(config.format, config.showSeconds);

	if (isLoading) {
		return (
			<div className="font-medium font-mono inline-flex items-center gap-1" role="status" aria-live="polite">
				<span>{displayLabel}:</span>
				<TextSkeleton
					width={placeholder.length * 0.6 + "ch"}
					height="1em"
					className="inline-block"
					aria-label="Loading current time"
				/>
			</div>
		);
	}

	const datetimeValue = currentDate 
		? formatTimeForDatetime(currentDate, config.timezone, config.showSeconds)
		: undefined;

	return (
		<div className="font-medium font-mono" role="status" aria-live="polite">
			<span>{displayLabel}: </span>
			<time 
				dateTime={datetimeValue}
				title={`Current time in ${config.timezone}`}
			>
				{currentTime}
			</time>
		</div>
	);
}
