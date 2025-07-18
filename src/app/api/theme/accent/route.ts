import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { themeSettings } from "@/db/schemas/theme-settings";
import { eq } from "drizzle-orm";

export async function GET() {
	try {
		const settings = await db
			.select()
			.from(themeSettings)
			.where(eq(themeSettings.settingKey, "accent_color"));

		const accentColor = settings[0]?.settingValue || "85 100% 65%";

		return NextResponse.json({ accentColor });
	} catch (error) {
		console.error("Failed to fetch accent color:", error);
		return NextResponse.json(
			{ error: "Failed to fetch accent color" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const { accentColor } = await request.json();

		if (!accentColor) {
			return NextResponse.json(
				{ error: "Accent color is required" },
				{ status: 400 },
			);
		}

		await db
			.update(themeSettings)
			.set({
				settingValue: accentColor,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(themeSettings.settingKey, "accent_color"));

		return NextResponse.json({
			message: "Accent color updated successfully",
			accentColor,
		});
	} catch (error) {
		console.error("Failed to update accent color:", error);
		return NextResponse.json(
			{ error: "Failed to update accent color" },
			{ status: 500 },
		);
	}
}

export async function POST() {
	try {
		const defaultAccentColor = "85 100% 65%";

		await db
			.update(themeSettings)
			.set({
				settingValue: defaultAccentColor,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(themeSettings.settingKey, "accent_color"));

		return NextResponse.json({
			message: "Accent color reset to default",
			accentColor: defaultAccentColor,
		});
	} catch (error) {
		console.error("Failed to reset accent color:", error);
		return NextResponse.json(
			{ error: "Failed to reset accent color" },
			{ status: 500 },
		);
	}
}
