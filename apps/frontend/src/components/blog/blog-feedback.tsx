'use client'

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';
import { API, apiFetch } from '@/config/api.config';

type TFeedbackReaction = {
  emoji: string;
  count: number;
  label?: string;
};

type TProps = {
  slug: string;
  className?: string;
};

const EMOJIS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💡', label: 'Insightful' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '🤔', label: 'Thinking' },
];

function generateFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillText('fingerprint', 10, 10);
  }
  const canvasFingerprint = canvas.toDataURL();
  
  const fingerprint = btoa(
    navigator.userAgent +
    navigator.language +
    screen.width + 'x' + screen.height +
    new Date().getTimezoneOffset() +
    canvasFingerprint.slice(-50)
  ).slice(0, 64);
  
  return fingerprint;
}

function getStoredFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  let fingerprint = localStorage.getItem('user-fingerprint');
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    localStorage.setItem('user-fingerprint', fingerprint);
  }
  return fingerprint;
}

function getUserVote(slug: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`feedback-vote-${slug}`);
}

function setUserVote(slug: string, emoji: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`feedback-vote-${slug}`, emoji);
}

function clearUserVote(slug: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`feedback-vote-${slug}`);
}

export function BlogFeedback({ slug, className }: TProps) {
  const [reactions, setReactions] = useState<TFeedbackReaction[]>(
    EMOJIS.map(e => ({ ...e, count: 0 }))
  );
  const [userVote, setUserVoteState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const fingerprint = getStoredFingerprint();

  const loadReactions = useCallback(async function loadReactions() {
    try {
      const response = await apiFetch<TFeedbackReaction[]>(
        API.blog.feedback.reactions(slug)
      );

      if (response.success && response.data) {
        const mergedReactions = EMOJIS.map(defaultEmoji => {
          const found = response.data?.find(r => r.emoji === defaultEmoji.emoji);
          return {
            ...defaultEmoji,
            count: found?.count || 0,
          };
        });
        setReactions(mergedReactions);
      }
    } catch (err) {
      console.error('Failed to load reactions:', err);
    }
  }, [slug]);

  useEffect(function initializeComponent() {
    const storedVote = getUserVote(slug);
    setUserVoteState(storedVote);
    loadReactions();
  }, [slug, loadReactions]);

  const handleVote = useCallback(async function handleVote(emoji: string) {
    if (isLoading) return;

    const isRemovingVote = userVote === emoji;
    
    setIsLoading(true);
    setError(null);

    setReactions(prev => prev.map(r => ({
      ...r,
      count: r.emoji === emoji
        ? Math.max(0, r.count + (isRemovingVote ? -1 : (userVote ? 0 : 1)))
        : r.emoji === userVote
        ? Math.max(0, r.count - 1)
        : r.count
    })));

    try {
      if (isRemovingVote) {
        const response = await apiFetch(
          `${API.blog.feedback.submit(slug)}?fingerprint=${encodeURIComponent(fingerprint)}`,
          { method: 'DELETE' }
        );

        if (response.success) {
          clearUserVote(slug);
          setUserVoteState(null);
          await loadReactions();
        } else {
          throw new Error(response.error || 'Failed to remove vote');
        }
      } else {
        const response = await apiFetch(
          `${API.blog.feedback.submit(slug)}?fingerprint=${encodeURIComponent(fingerprint)}`,
          {
            method: 'POST',
            body: JSON.stringify({
              emoji,
              fingerprint,
              url: window.location.href,
              userAgent: navigator.userAgent,
            }),
          }
        );

        if (response.success) {
          setUserVote(slug, emoji);
          setUserVoteState(emoji);
          await loadReactions();
        } else {
          throw new Error(response.error || 'Failed to submit vote');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      await loadReactions();
    } finally {
      setIsLoading(false);
    }
  }, [slug, fingerprint, userVote, isLoading, loadReactions]);

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'flex items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6',
          'rounded-2xl bg-muted/20 border border-border/40',
          'backdrop-blur-sm transition-all duration-300',
          'hover:bg-muted/30 hover:border-border/60'
        )}
      >
        {reactions.map((reaction, idx) => {
          const isVoted = userVote === reaction.emoji;
          const isHovered = hoveredEmoji === reaction.emoji;

          return (
            <motion.button
              key={reaction.emoji}
              disabled={isLoading}
              onClick={() => handleVote(reaction.emoji)}
              onMouseEnter={() => setHoveredEmoji(reaction.emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: idx * 0.05,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'w-14 h-14 sm:w-16 sm:h-16',
                'rounded-xl transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-accent focus-visible:ring-offset-2',
                'focus-visible:ring-offset-background',
                isVoted
                  ? 'bg-accent/15 border-2 border-accent/50 shadow-lg shadow-accent/20'
                  : 'bg-background/40 border border-border/30 hover:bg-accent/5 hover:border-accent/30',
                isLoading && 'opacity-50 cursor-wait'
              )}
              aria-label={`${isVoted ? 'Remove' : 'Vote'} ${reaction.label || reaction.emoji}`}
              title={isVoted ? `Remove your ${reaction.label} vote` : `Vote ${reaction.label}`}
            >
              <motion.span
                className="text-2xl sm:text-3xl leading-none"
                animate={isVoted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {reaction.emoji}
              </motion.span>

              <AnimatePresence mode="wait">
                {(reaction.count > 0 || isVoted) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'absolute -top-1 -right-1',
                      'min-w-[22px] h-[22px] px-1.5',
                      'flex items-center justify-center',
                      'text-[11px] font-bold rounded-full',
                      'shadow-md',
                      isVoted
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <AnimatedNumber
                      value={reaction.count}
                      className="font-mono"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isHovered && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute -bottom-8 left-1/2 -translate-x-1/2',
                      'px-2 py-1 rounded-md',
                      'bg-popover border border-border',
                      'text-xs text-popover-foreground whitespace-nowrap',
                      'pointer-events-none shadow-lg z-10'
                    )}
                  >
                    {isVoted ? `Remove ${reaction.label}` : reaction.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-sm text-center text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userVote && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-xs text-center text-muted-foreground"
          >
            Click your vote again to remove it
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
