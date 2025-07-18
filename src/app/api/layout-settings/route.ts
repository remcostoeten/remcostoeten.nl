import { db } from "@/db/db";
import { globalLayoutSettings, layoutSettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const pageId = searchParams.get("pageId");
		const settingKey = searchParams.get("settingKey");
		const global = searchParams.get("global") === "true";

		if (global) {
			if (settingKey) {
				const setting = await db
					.select()
					.from(globalLayoutSettings)
					.where(eq(globalLayoutSettings.settingKey, settingKey))
					.get();

				if (!setting) {
					return NextResponse.json(
						{ error: "Setting not found" },
						{ status: 404 },
					);
				}

				return NextResponse.json({
					success: true,
					data: {
						...setting,
						parsedValue: parseSettingValue(
							setting.settingValue,
							setting.settingType,
						),
					},
				});
			}

			const settings = await db
				.select()
				.from(globalLayoutSettings)
				.where(eq(globalLayoutSettings.isActive, 1))
				.all();

			return NextResponse.json({
				success: true,
				data: settings.map((setting) => ({
					...setting,
					parsedValue: parseSettingValue(
						setting.settingValue,
						setting.settingType,
					),
				})),
			});
		}

		if (pageId) {
			const query = db.select().from(layoutSettings);

			if (settingKey) {
				const setting = await query
					.where(
						and(
							eq(layoutSettings.pageId, parseInt(pageId)),
							eq(layoutSettings.settingKey, settingKey),
						),
					)
					.get();

				if (!setting) {
					return NextResponse.json(
						{ error: "Setting not found" },
						{ status: 404 },
					);
				}

				return NextResponse.json({
					success: true,
					data: {
						...setting,
						parsedValue: parseSettingValue(
							setting.settingValue,
							setting.settingType,
						),
					},
				});
			}

			const settings = await query
				.where(eq(layoutSettings.pageId, parseInt(pageId)))
				.all();

			return NextResponse.json({
				success: true,
				data: settings.map((setting) => ({
					...setting,
					parsedValue: parseSettingValue(
						setting.settingValue,
						setting.settingType,
					),
				})),
			});
		}

		return NextResponse.json(
			{ error: "pageId or global=true parameter is required" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("Error fetching layout settings:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			pageId,
			settingKey,
			settingValue,
			settingType = "string",
			description,
			global = false,
		} = body;

		if (!settingKey || settingValue === undefined) {
			return NextResponse.json(
				{ error: "settingKey and settingValue are required" },
				{ status: 400 },
			);
		}

		const stringValue = serializeSettingValue(settingValue, settingType);

		if (global) {
			const existingSetting = await db
				.select()
				.from(globalLayoutSettings)
				.where(eq(globalLayoutSettings.settingKey, settingKey))
				.get();

			if (existingSetting) {
				const [updatedSetting] = await db
					.update(globalLayoutSettings)
					.set({
						settingValue: stringValue,
						settingType,
						description,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(globalLayoutSettings.settingKey, settingKey))
					.returning();

				return NextResponse.json({
					success: true,
					data: {
						...updatedSetting,
						parsedValue: parseSettingValue(
							updatedSetting.settingValue,
							updatedSetting.settingType,
						),
					},
				});
			}

			const [newSetting] = await db
				.insert(globalLayoutSettings)
				.values({
					settingKey,
					settingValue: stringValue,
					settingType,
					description,
					isActive: 1,
				})
				.returning();

			return NextResponse.json({
				success: true,
				data: {
					...newSetting,
					parsedValue: parseSettingValue(
						newSetting.settingValue,
						newSetting.settingType,
					),
				},
			});
		}

		if (!pageId) {
			return NextResponse.json(
				{ error: "pageId is required for page-specific settings" },
				{ status: 400 },
			);
		}

		const existingSetting = await db
			.select()
			.from(layoutSettings)
			.where(
				and(
					eq(layoutSettings.pageId, parseInt(pageId)),
					eq(layoutSettings.settingKey, settingKey),
				),
			)
			.get();

		if (existingSetting) {
			const [updatedSetting] = await db
				.update(layoutSettings)
				.set({
					settingValue: stringValue,
					settingType,
					description,
					updatedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(layoutSettings.pageId, parseInt(pageId)),
						eq(layoutSettings.settingKey, settingKey),
					),
				)
				.returning();

			return NextResponse.json({
				success: true,
				data: {
					...updatedSetting,
					parsedValue: parseSettingValue(
						updatedSetting.settingValue,
						updatedSetting.settingType,
					),
				},
			});
		}

		const [newSetting] = await db
			.insert(layoutSettings)
			.values({
				pageId: parseInt(pageId),
				settingKey,
				settingValue: stringValue,
				settingType,
				description,
			})
			.returning();

		return NextResponse.json({
			success: true,
			data: {
				...newSetting,
				parsedValue: parseSettingValue(
					newSetting.settingValue,
					newSetting.settingType,
				),
			},
		});
	} catch (error) {
		console.error("Error saving layout setting:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const pageId = searchParams.get("pageId");
		const settingKey = searchParams.get("settingKey");
		const global = searchParams.get("global") === "true";

		if (!settingKey) {
			return NextResponse.json(
				{ error: "settingKey is required" },
				{ status: 400 },
			);
		}

		if (global) {
			await db
				.delete(globalLayoutSettings)
				.where(eq(globalLayoutSettings.settingKey, settingKey));
		} else {
			if (!pageId) {
				return NextResponse.json(
					{ error: "pageId is required for page-specific settings" },
					{ status: 400 },
				);
			}

			await db
				.delete(layoutSettings)
				.where(
					and(
						eq(layoutSettings.pageId, parseInt(pageId)),
						eq(layoutSettings.settingKey, settingKey),
					),
				);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting layout setting:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

function parseSettingValue(value: string, type: string): any {
	switch (type) {
		case "number":
			return parseFloat(value);
		case "boolean":
			return value === "true";
		case "json":
			try {
				return JSON.parse(value);
			} catch {
				return value;
			}
		default:
			return value;
	}
}

function serializeSettingValue(value: any, type: string): string {
	switch (type) {
		case "number":
			return value.toString();
		case "boolean":
			return value ? "true" : "false";
		case "json":
			return JSON.stringify(value);
		default:
			return value.toString();
	}
}
