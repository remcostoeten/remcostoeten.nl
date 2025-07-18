"use client";

import { useState, useEffect, useCallback } from "react";

export type TLayoutSetting = {
	id: number;
	pageId?: number;
	settingKey: string;
	settingValue: string;
	settingType: "string" | "number" | "boolean" | "json";
	description?: string;
	parsedValue: any;
	createdAt: string;
	updatedAt: string;
};

export type TLayoutSettings = {
	[key: string]: TLayoutSetting;
};

export function useLayoutSettings(pageId?: number, global = false) {
	const [settings, setSettings] = useState<TLayoutSettings>({});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSettings = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (pageId && !global) {
				params.set("pageId", pageId.toString());
			}
			if (global) {
				params.set("global", "true");
			}

			const response = await fetch(`/api/layout-settings?${params}`);

			if (!response.ok) {
				throw new Error("Failed to fetch layout settings");
			}

			const result = await response.json();

			if (result.success) {
				const settingsMap = result.data.reduce(
					(acc: TLayoutSettings, setting: TLayoutSetting) => {
						acc[setting.settingKey] = setting;
						return acc;
					},
					{},
				);

				setSettings(settingsMap);
			} else {
				throw new Error(result.error || "Failed to fetch settings");
			}
		} catch (error) {
			console.error("Error fetching layout settings:", error);
			setError(error instanceof Error ? error.message : "Unknown error");
		} finally {
			setIsLoading(false);
		}
	}, [pageId, global]);

	const getSetting = useCallback(
		(key: string, defaultValue?: any) => {
			const setting = settings[key];
			return setting ? setting.parsedValue : defaultValue;
		},
		[settings],
	);

	const updateSetting = useCallback(
		async (
			key: string,
			value: any,
			type: TLayoutSetting["settingType"] = "string",
			description?: string,
		) => {
			try {
				const response = await fetch("/api/layout-settings", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						pageId: global ? undefined : pageId,
						settingKey: key,
						settingValue: value,
						settingType: type,
						description,
						global,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to update setting");
				}

				const result = await response.json();

				if (result.success) {
					setSettings((prev) => ({
						...prev,
						[key]: result.data,
					}));
					return result.data;
				} else {
					throw new Error(result.error || "Failed to update setting");
				}
			} catch (error) {
				console.error("Error updating setting:", error);
				throw error;
			}
		},
		[pageId, global],
	);

	const deleteSetting = useCallback(
		async (key: string) => {
			try {
				const params = new URLSearchParams();
				params.set("settingKey", key);
				if (pageId && !global) {
					params.set("pageId", pageId.toString());
				}
				if (global) {
					params.set("global", "true");
				}

				const response = await fetch(`/api/layout-settings?${params}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error("Failed to delete setting");
				}

				const result = await response.json();

				if (result.success) {
					setSettings((prev) => {
						const { [key]: deleted, ...rest } = prev;
						return rest;
					});
				} else {
					throw new Error(result.error || "Failed to delete setting");
				}
			} catch (error) {
				console.error("Error deleting setting:", error);
				throw error;
			}
		},
		[pageId, global],
	);

	useEffect(() => {
		if (pageId || global) {
			fetchSettings();
		}
	}, [fetchSettings, pageId, global]);

	return {
		settings,
		isLoading,
		error,
		getSetting,
		updateSetting,
		deleteSetting,
		refetch: fetchSettings,
	};
}

export type TWidthValue = {
	value: number;
	unit: "px" | "vw" | "%";
};

export function useContainerWidth(pageId?: number, global = false) {
	const { getSetting, updateSetting, isLoading } = useLayoutSettings(
		pageId,
		global,
	);

	const defaultWidth: TWidthValue = { value: 672, unit: "px" };
	const containerWidth = getSetting("containerWidth", defaultWidth); // Default to max-w-2xl equivalent

	const setContainerWidth = useCallback(
		async (width: TWidthValue) => {
			return updateSetting(
				"containerWidth",
				width,
				"json",
				"Container width setting for content layout",
			);
		},
		[updateSetting],
	);

	return {
		containerWidth,
		setContainerWidth,
		isLoading,
	};
}
