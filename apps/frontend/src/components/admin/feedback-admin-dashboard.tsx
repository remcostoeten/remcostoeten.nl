'use client';

import { useState, useEffect } from 'react';
import { API, apiFetch } from '@/config/api.config';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquare, TrendingUp, User } from 'lucide-react';

type TFeedback = {
  id: number;
  slug: string;
  emoji: string;
  message?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
};

type TFeedbackStats = {
  totalFeedback: number;
  totalWithMessages: number;
  uniqueSlugs: number;
  emojiBreakdown: Record<string, number>;
};

export function FeedbackAdminDashboard() {
  const [feedback, setFeedback] = useState<TFeedback[]>([]);
  const [stats, setStats] = useState<TFeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(function loadFeedback() {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch<TFeedback[]>(API.blog.feedback.all());

        if (response.success && response.data) {
          const feedbackData = Array.isArray(response.data) ? response.data : [];
          setFeedback(feedbackData);

          const totalFeedback = feedbackData.length;
          const totalWithMessages = feedbackData.filter(f => f.message).length;
          const uniqueSlugs = new Set(feedbackData.map(f => f.slug)).size;
          
          const emojiBreakdown = feedbackData.reduce<Record<string, number>>((acc, f) => {
            acc[f.emoji] = (acc[f.emoji] || 0) + 1;
            return acc;
          }, {});

          setStats({
            totalFeedback,
            totalWithMessages,
            uniqueSlugs,
            emojiBreakdown,
          });
        } else {
          throw new Error(response.error || 'Failed to load feedback');
        }
      } catch (err) {
        console.error('Error loading feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feedback');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  function formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Feedback</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalFeedback}</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">With Messages</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalWithMessages}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.totalWithMessages / stats.totalFeedback) * 100)}% of total
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Unique Posts</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.uniqueSlugs}</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Reactions</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.emojiBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([emoji, count]) => (
                  <div
                    key={emoji}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs"
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">All Feedback</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {feedback.length} {feedback.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {feedback.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No feedback yet
                  </td>
                </tr>
              ) : (
                feedback.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-foreground truncate">
                            {item.slug}
                          </div>
                          {item.url && (
                            <div className="text-xs text-muted-foreground truncate">
                              {new URL(item.url).pathname}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{item.emoji}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "text-sm",
                        item.message ? "text-foreground" : "text-muted-foreground italic"
                      )}>
                        {item.message || 'No message'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
