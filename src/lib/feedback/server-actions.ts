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

export async function deleteFeedbackAction(id: string) {
  const feedbackFactory = createFeedbackFactory();
  
  try {
    await feedbackFactory.destroy(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return { success: false, error: "Failed to delete feedback" };
  }
}
