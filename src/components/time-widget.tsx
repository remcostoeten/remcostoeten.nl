"use client";

import { useEffect, useState } from "react";
import type { TTimeWidgetConfig } from "@/lib/cms/types";
import { TextSkeleton } from "@/components/ui/text-skeleton";

type TProps = {
	config: TTimeWidgetConfig;
};

export function TimeWidget({ config }: TProps) {
	const [currentTime, setCurrentTime] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	function formatTime(date: Date, timezone: string, format: '12h' | '24h', showSeconds: boolean): string {
		const options: Intl.DateTimeFormatOptions = {
			timeZone: timezone,
			hour: 'numeric',
			minute: '2-digit',
			hour12: format === '12h'
		};

		if (showSeconds) {
			options.second = '2-digit';
		}

		return new Intl.DateTimeFormat('en-US', options).format(date);
	}

	function getPlaceholderTime(format: '12h' | '24h', showSeconds: boolean): string {
		if (format === '12h') {
			return showSeconds ? "12:00:00 AM" : "12:00 AM";
		}
		return showSeconds ? "00:00:00" : "00:00";
	}

	useEffect(function setupTimeUpdate() {
		function updateTime() {
			const now = new Date();
			const formattedTime = formatTime(now, config.timezone, config.format, config.showSeconds);
			setCurrentTime(formattedTime);
			setIsLoading(false);
		}

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return function cleanup() {
			clearInterval(interval);
		};
	}, [config.timezone, config.format, config.showSeconds]);

	const displayLabel = config.label || config.timezone;
	const placeholder = getPlaceholderTime(config.format, config.showSeconds);

	if (isLoading) {
		return (
			<span className="font-medium font-mono inline-flex items-center gap-1">
				<span>{displayLabel}:</span>
				<TextSkeleton 
					width={placeholder.length * 0.6 + "ch"}
					height="1em"
					className="inline-block"
				/>
			</span>
		);
	}

	return (
		<span className="font-medium font-mono">
			{displayLabel}: {currentTime}
		</span>
	);
}
