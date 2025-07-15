"use client";

import { useEffect, useState } from "react";
import type { TTimeWidgetConfig } from "@/lib/cms/types";

type TProps = {
	config: TTimeWidgetConfig;
};

export function TimeWidget({ config }: TProps) {
	const [currentTime, setCurrentTime] = useState<string>("");

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

	useEffect(function setupTimeUpdate() {
		function updateTime() {
			const now = new Date();
			const formattedTime = formatTime(now, config.timezone, config.format, config.showSeconds);
			setCurrentTime(formattedTime);
		}

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return function cleanup() {
			clearInterval(interval);
		};
	}, [config.timezone, config.format, config.showSeconds]);

	const displayLabel = config.label || config.timezone;

	return (
		<span className="font-medium font-mono">
			{displayLabel}: {currentTime || "--:--"}
		</span>
	);
}
