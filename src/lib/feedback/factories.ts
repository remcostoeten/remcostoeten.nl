import type { InferSelectModel } from "drizzle-orm";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/db";
import { feedback } from "@/db/schema";

type TFeedbackEntity = InferSelectModel<typeof feedback>;

type TFeedbackCreateInput = {
	name: string;
	message: string;
	emoji: string;
	userAgent?: string;
	ipAddress?: string;
	referrer?: string;
	browser?: string;
};

type TFeedbackUpdateInput = Partial<TFeedbackCreateInput> & {
	isRead?: boolean;
};

export function createFeedbackFactory() {
	async function create(data: TFeedbackCreateInput): Promise<TFeedbackEntity> {
		const newFeedback = await db
			.insert(feedback)
			.values({
				name: data.name,
				message: data.message,
				emoji: data.emoji,
				userAgent: data.userAgent || null,
				ipAddress: data.ipAddress || null,
				referrer: data.referrer || null,
				browser: data.browser || null,
			})
			.returning()
			.execute();

		return newFeedback[0] as TFeedbackEntity;
	}

	async function read(): Promise<TFeedbackEntity[]> {
		const feedbacks = await db
			.select()
			.from(feedback)
			.orderBy(desc(feedback.createdAt))
			.execute();

		return feedbacks as TFeedbackEntity[];
	}

	async function update(
		id: number,
		data: TFeedbackUpdateInput,
	): Promise<TFeedbackEntity> {
		const updatedFeedback = await db
			.update(feedback)
			.set({
				...data,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(feedback.id, id))
			.returning()
			.execute();

		return updatedFeedback[0] as TFeedbackEntity;
	}

	async function destroy(id: number): Promise<void> {
		await db.delete(feedback).where(eq(feedback.id, id)).execute();
	}

	async function markAsRead(id: number): Promise<TFeedbackEntity> {
		const updatedFeedback = await db
			.update(feedback)
			.set({
				isRead: true,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(feedback.id, id))
			.returning()
			.execute();

		return updatedFeedback[0] as TFeedbackEntity;
	}

	async function getUnreadCount(): Promise<number> {
		const result = await db
			.select({ count: feedback.id })
			.from(feedback)
			.where(eq(feedback.isRead, false))
			.execute();

		return result.length;
	}

	return {
		create,
		read,
		update,
		destroy,
		markAsRead,
		getUnreadCount,
	};
}
