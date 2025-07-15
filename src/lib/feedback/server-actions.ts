"use server";

import { createFeedbackFactory } from "./factories";

export async function createFeedbackAction(data: {
	name: string;
	message: string;
	emoji: string;
	userAgent?: string;
	ipAddress?: string;
	referrer?: string;
	browser?: string;
}) {
	const feedbackFactory = createFeedbackFactory();

	try {
		const newFeedback = await feedbackFactory.create(data);
		return { success: true, data: newFeedback };
	} catch (error) {
		console.error("Failed to create feedback:", error);
		return { success: false, error: "Failed to create feedback" };
	}
}

export async function markFeedbackAsReadAction(id: string) {
	const feedbackFactory = createFeedbackFactory();

	try {
		const updatedFeedback = await feedbackFactory.markAsRead(parseInt(id));
		return { success: true, data: updatedFeedback };
	} catch (error) {
		console.error("Failed to mark feedback as read:", error);
		return { success: false, error: "Failed to mark feedback as read" };
	}
}

export async function getUnreadFeedbackCountAction() {
	const feedbackFactory = createFeedbackFactory();

	try {
		const unreadCount = await feedbackFactory.getUnreadCount();
		return { success: true, data: unreadCount };
	} catch (error) {
		console.error("Failed to get unread feedback count:", error);
		return { success: false, error: "Failed to get unread feedback count" };
	}
}

export async function readFeedbacksAction() {
	const feedbackFactory = createFeedbackFactory();

	try {
		const feedbacks = await feedbackFactory.read();
		return { success: true, data: feedbacks };
	} catch (error) {
		console.error("Failed to read feedbacks:", error);
		return { success: false, error: "Failed to read feedbacks" };
	}
}

export async function updateFeedbackAction(
	id: string,
	data: {
		name?: string;
		message?: string;
		emoji?: string;
		userAgent?: string;
		ipAddress?: string;
		referrer?: string;
		browser?: string;
	},
) {
	const feedbackFactory = createFeedbackFactory();

	try {
		const updatedFeedback = await feedbackFactory.update(parseInt(id), data);
		return { success: true, data: updatedFeedback };
	} catch (error) {
		console.error("Failed to update feedback:", error);
		return { success: false, error: "Failed to update feedback" };
	}
}

export async function deleteFeedbackAction(id: string) {
	const feedbackFactory = createFeedbackFactory();

	try {
		await feedbackFactory.destroy(parseInt(id));
		return { success: true };
	} catch (error) {
		console.error("Failed to delete feedback:", error);
		return { success: false, error: "Failed to delete feedback" };
	}
}
