"use client";

import { createContext, useContext, useEffect, useState } from "react";

type TAccentColorVariations = {
	primary: string;
	hover: string;
	active: string;
	muted: string;
	contrast: string;
};

type TThemeContextValue = {
	accentColor: string;
	accentVariations: TAccentColorVariations;
	updateAccentColor: (color: string) => Promise<void>;
	resetAccentColor: () => Promise<void>;
	isLoading: boolean;
	previewColor: string | null;
	setPreviewColor: (color: string | null) => void;
	getContrastRatio: (color: string) => number;
	isAccessible: (color: string) => boolean;
};

type TProps = {
	children: React.ReactNode;
};

const ThemeContext = createContext<TThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: TProps) {
	const [accentColor, setAccentColor] = useState<string>("85 100% 65%");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [previewColor, setPreviewColor] = useState<string | null>(null);

	useEffect(function loadInitialTheme() {
		// Apply default theme variables immediately
		updateCSSVariables(accentColor);

		async function fetchAccentColor() {
			try {
				const response = await fetch("/api/theme/accent");
				const data = await response.json();

				if (response.ok) {
					setAccentColor(data.accentColor);
					updateCSSVariables(data.accentColor);
				}
			} catch (error) {
				console.error("Failed to fetch accent color:", error);
				// Fallback to default on error
				updateCSSVariables(accentColor);
			} finally {
				setIsLoading(false);
			}
		}

		fetchAccentColor();
	}, []);

	useEffect(
		function handlePreviewColor() {
			updatePreviewCSS(previewColor);
		},
		[previewColor],
	);

	function handleSetPreviewColor(color: string | null) {
		setPreviewColor(color);
	}

	function generateAccentVariations(color: string): TAccentColorVariations {
		const [h, s, l] = color
			.split(" ")
			.map((val) => parseFloat(val.replace("%", "")));

		return {
			primary: color,
			hover: `${h} ${s}% ${Math.min(l + 10, 100)}%`,
			active: `${h} ${s}% ${Math.max(l - 10, 0)}%`,
			muted: `${h} ${Math.max(s - 30, 0)}% ${Math.min(l + 20, 100)}%`,
			contrast: l > 50 ? `${h} ${s}% 20%` : `${h} ${s}% 90%`,
		};
	}

	function updateCSSVariables(color: string) {
		const variations = generateAccentVariations(color);

		document.documentElement.style.setProperty("--accent", variations.primary);
		document.documentElement.style.setProperty(
			"--accent-hover",
			variations.hover,
		);
		document.documentElement.style.setProperty(
			"--accent-active",
			variations.active,
		);
		document.documentElement.style.setProperty(
			"--accent-muted",
			variations.muted,
		);
		document.documentElement.style.setProperty(
			"--accent-contrast",
			variations.contrast,
		);

		document.documentElement.style.setProperty(
			"--highlight-product",
			variations.primary,
		);
		document.documentElement.style.setProperty(
			"--highlight-frontend",
			variations.primary,
		);
	}

	function updatePreviewCSS(color: string | null) {
		if (color) {
			const variations = generateAccentVariations(color);
			document.documentElement.style.setProperty(
				"--accent-preview",
				variations.primary,
			);
			document.documentElement.style.setProperty(
				"--accent-preview-hover",
				variations.hover,
			);
		} else {
			document.documentElement.style.removeProperty("--accent-preview");
			document.documentElement.style.removeProperty("--accent-preview-hover");
		}
	}

	function hslToRgb(h: number, s: number, l: number): [number, number, number] {
		s /= 100;
		l /= 100;
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;
		let r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
	}

	function getLuminance(r: number, g: number, b: number): number {
		const [rs, gs, bs] = [r, g, b].map((c) => {
			c = c / 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
	}

	function getContrastRatio(color: string): number {
		const [h, s, l] = color
			.split(" ")
			.map((val) => parseFloat(val.replace("%", "")));
		const [r, g, b] = hslToRgb(h, s, l);
		const colorLuminance = getLuminance(r, g, b);
		const backgroundLuminance = getLuminance(18, 18, 18);

		const lighter = Math.max(colorLuminance, backgroundLuminance);
		const darker = Math.min(colorLuminance, backgroundLuminance);

		return (lighter + 0.05) / (darker + 0.05);
	}

	function isAccessible(color: string): boolean {
		return getContrastRatio(color) >= 4.5;
	}

	function updateCSSVariable(color: string) {
		updateCSSVariables(color);
	}

	async function updateAccentColor(color: string) {
		setIsLoading(true);
		try {
			const response = await fetch("/api/theme/accent", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ accentColor: color }),
			});

			if (response.ok) {
				setAccentColor(color);
				updateCSSVariable(color);
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to update accent color");
			}
		} catch (error) {
			console.error("Failed to update accent color:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}

	async function resetAccentColor() {
		setIsLoading(true);
		try {
			const response = await fetch("/api/theme/accent", {
				method: "POST",
			});

			if (response.ok) {
				const data = await response.json();
				setAccentColor(data.accentColor);
				updateCSSVariable(data.accentColor);
			} else {
				const error = await response.json();
				throw new Error(error.error || "Failed to reset accent color");
			}
		} catch (error) {
			console.error("Failed to reset accent color:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}

	const accentVariations = generateAccentVariations(accentColor);

	return (
		<ThemeContext.Provider
			value={{
				accentColor,
				accentVariations,
				updateAccentColor,
				resetAccentColor,
				isLoading,
				previewColor,
				setPreviewColor: handleSetPreviewColor,
				getContrastRatio,
				isAccessible,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
