import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { blogFeedback } from '../schema/blog-feedback';
import type { TBlogFeedback, TNewBlogFeedback } from '../schema/blog-feedback';
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

type TDrizzleDb = any;

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

    // Simple server-side rate limiting: max 3 per 24h per ipHash per slug
    if (ipHash) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recent = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(blogFeedback)
        .where(and(
          eq(blogFeedback.slug, slug),
          eq(blogFeedback.ipHash, ipHash),
          gte(blogFeedback.timestamp, since as unknown as any)
        ));
      const recentCount = Array.isArray(recent) ? (recent[0]?.count || 0) : 0;
      if (recentCount >= 3) {
        throw Object.assign(new Error('Rate limit exceeded'), { code: 'RATE_LIMIT' });
      }
    }

    // Upsert by (slug, fingerprint): if duplicate, update emoji/message/url and updated timestamp
    try {
      const [inserted] = await db.insert(blogFeedback)
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
        emoji: inserted.emoji,
        message: inserted.message || undefined,
        timestamp: inserted.timestamp,
      };
    } catch (err: any) {
      // Unique violation -> update existing row for this (slug,fingerprint)
      const isUnique = err?.code === '23505' || String(err?.message || '').includes('slug_fingerprint');
      if (!isUnique || !fingerprint) throw err;

      const [updated] = await db
        .update(blogFeedback)
        .set({
          emoji: data.emoji,
          message: data.message,
          url: data.url,
          userAgent: data.userAgent,
          timestamp: sql`NOW()` as unknown as string,
        })
        .where(and(
          eq(blogFeedback.slug, slug),
          eq(blogFeedback.fingerprint, fingerprint)
        ))
        .returning();

      return {
        emoji: updated.emoji,
        message: updated.message || undefined,
        timestamp: updated.timestamp,
      };
    }
  }

  async function getFeedbackBySlug(slug: string): Promise<TFeedbackStats> {
    const allFeedback: TBlogFeedback[] = await db.select()
      .from(blogFeedback)
      .where(eq(blogFeedback.slug, slug))
      .orderBy(desc(blogFeedback.timestamp));

    const reactionCounts = allFeedback.reduce<Record<string, number>>((acc, feedback) => {
      acc[feedback.emoji] = (acc[feedback.emoji] || 0) + 1;
      return acc;
    }, {});

    const reactionsEntries = Object.entries(reactionCounts).map(([emoji, count]) => ({ emoji, count }));
    const reactions: TFeedbackReaction[] = reactionsEntries.sort((a, b) => b.count - a.count) as TFeedbackReaction[];

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

    return result as unknown as TFeedbackReaction[];
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