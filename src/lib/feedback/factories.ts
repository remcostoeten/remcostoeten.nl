import { eq, desc } from "drizzle-orm";
import { db } from "@/db/db";
import { feedback } from "@/db/feedback-schema";
import type { TBaseEntity } from "@/db/types";

type TFeedbackEntity = TBaseEntity & {
  name: string;
  message: string;
  emoji: string;
  userAgent: string | null;
  ipAddress: string | null;
  referrer: string | null;
  browser: string | null;
};

type TFeedbackCreateInput = {
  name: string;
  message: string;
  emoji: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  browser?: string;
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

  async function destroy(id: number): Promise<void> {
    await db.delete(feedback).where(eq(feedback.id, id)).execute();
  }

  return {
    create,
    read,
    destroy,
  };
}
