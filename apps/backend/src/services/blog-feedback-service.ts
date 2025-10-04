import { eq, and, desc, sql } from 'drizzle-orm';
import { TDrizzleDb } from '../db/config';
import { blogFeedback, TBlogFeedback, TNewBlogFeedback } from '../schema/blog-feedback';
import crypto from 'crypto';

type TFeedbackReaction = {
  emoji: string;
  count: number;
};

type TFeedbackStats = {
  totalFeedback: number;
  reactions: TFeedbackReaction[];
  recentFeedback: Array<{
    emoji: string;
    message?: string;
    timestamp: string;
  }>;
};

type TFeedbackData = {
  emoji: string;
  message?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
};

export type TBlogFeedbackService = ReturnType<typeof createBlogFeedbackService>;

export function createBlogFeedbackService(db: TDrizzleDb) {
  function hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex');
  }

  function generateFingerprint(userAgent: string, ip: string): string {
    const data = `${userAgent}-${ip}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async function submitFeedback(
    slug: string,
    data: Omit<TFeedbackData, 'timestamp'>,
    ip?: string
  ): Promise<TFeedbackData> {
    const ipHash = ip ? hashIP(ip) : undefined;
    const fingerprint = data.userAgent && ip 
      ? generateFingerprint(data.userAgent, ip) 
      : undefined;

    const [feedback] = await db.insert(blogFeedback)
      .values({
        slug,
        emoji: data.emoji,
        message: data.message,
        url: data.url,
        userAgent: data.userAgent,
        ipHash,
        fingerprint,
      })
      .returning();

    return {
      emoji: feedback.emoji,
      message: feedback.message || undefined,
      timestamp: feedback.timestamp,
    };
  }

  async function getFeedbackBySlug(slug: string): Promise<TFeedbackStats> {
    const allFeedback = await db.select()
      .from(blogFeedback)
      .where(eq(blogFeedback.slug, slug))
      .orderBy(desc(blogFeedback.timestamp));

    const reactionCounts = allFeedback.reduce((acc, feedback) => {
      acc[feedback.emoji] = (acc[feedback.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reactions: TFeedbackReaction[] = Object.entries(reactionCounts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count);

    const recentFeedback = allFeedback
      .slice(0, 10)
      .map(feedback => ({
        emoji: feedback.emoji,
        message: feedback.message || undefined,
        timestamp: feedback.timestamp,
      }));

    return {
      totalFeedback: allFeedback.length,
      reactions,
      recentFeedback,
    };
  }

  async function getFeedbackReactions(slug: string): Promise<TFeedbackReaction[]> {
    const result = await db.select({
      emoji: blogFeedback.emoji,
      count: sql<number>`count(*)`.mapWith(Number),
    })
      .from(blogFeedback)
      .where(eq(blogFeedback.slug, slug))
      .groupBy(blogFeedback.emoji)
      .orderBy(desc(sql`count(*)`));

    return result;
  }

  async function getUserFeedback(
    slug: string,
    fingerprint: string
  ): Promise<TBlogFeedback | null> {
    const [feedback] = await db.select()
      .from(blogFeedback)
      .where(
        and(
          eq(blogFeedback.slug, slug),
          eq(blogFeedback.fingerprint, fingerprint)
        )
      )
      .orderBy(desc(blogFeedback.timestamp))
      .limit(1);

    return feedback || null;
  }

  async function hasUserSubmittedFeedback(
    slug: string,
    fingerprint: string
  ): Promise<boolean> {
    const feedback = await getUserFeedback(slug, fingerprint);
    return !!feedback;
  }

  async function deleteFeedback(id: number): Promise<boolean> {
    const result = await db.delete(blogFeedback)
      .where(eq(blogFeedback.id, id))
      .returning();

    return result.length > 0;
  }

  async function getAllFeedback(
    limit = 100,
    offset = 0
  ): Promise<TBlogFeedback[]> {
    return await db.select()
      .from(blogFeedback)
      .orderBy(desc(blogFeedback.timestamp))
      .limit(limit)
      .offset(offset);
  }

  return {
    submitFeedback,
    getFeedbackBySlug,
    getFeedbackReactions,
    getUserFeedback,
    hasUserSubmittedFeedback,
    deleteFeedback,
    getAllFeedback,
  };
}