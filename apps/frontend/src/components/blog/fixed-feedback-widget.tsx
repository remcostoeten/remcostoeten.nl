'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, ChevronDown, ChevronUp, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useScrollAwareVisibility } from '@/hooks/use-scroll-aware-visibility';
import { API, apiFetch } from '@/config/api.config';

type TProps = {
  slug: string;
};

type TFeedbackReaction = {
  emoji: string;
  count: number;
  label?: string;
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

export function FixedFeedbackWidget({ slug }: TProps) {
  const [reactions, setReactions] = useState<TFeedbackReaction[]>(
    EMOJIS.map(e => ({ ...e, count: 0 }))
  );
  const [userVote, setUserVoteState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState<number>(0);

  const {
    isVisible,
    scrollDirection,
    scrollPercentage,
    isMinimized,
    setIsMinimized,
  } = useScrollAwareVisibility({
    threshold: 50,
    hideOnScrollDown: true,
    showOnScrollUp: true,
    debounceMs: 100,
  });

  const fingerprint = getStoredFingerprint();

  const loadReactions = useCallback(async function loadReactions() {
    try {
      const response = await apiFetch<TFeedbackReaction[]>(
        API.blog.feedback.reactions(slug)
      );

      if (response.success && response.data) {
        const reactionsData = Array.isArray(response.data) ? response.data : [];
        const mergedReactions = EMOJIS.map(defaultEmoji => {
          const found = reactionsData.find(r => r.emoji === defaultEmoji.emoji);
          return {
            ...defaultEmoji,
            count: found?.count || 0,
          };
        });
        setReactions(mergedReactions);
        
        const totalCount = mergedReactions.reduce((sum, r) => sum + r.count, 0);
        setTotalFeedbackCount(totalCount);
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
          setIsExpanded(true);
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

  const handleSubmitMessage = useCallback(async function handleSubmitMessage() {
    if (!userVote || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch(
        `${API.blog.feedback.submit(slug)}?fingerprint=${encodeURIComponent(fingerprint)}`,
        {
          method: 'POST',
          body: JSON.stringify({
            emoji: userVote,
            fingerprint,
            message: message.trim() || undefined,
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }
      );

      if (response.success) {
        setIsExpanded(false);
        setMessage('');
        setTimeout(function hideWidget() {
          setIsMinimized(true);
        }, 500);
      } else {
        throw new Error(response.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, [slug, fingerprint, userVote, message, isSubmitting, setIsMinimized]);

  const handleSkipMessage = useCallback(function handleSkipMessage() {
    setIsExpanded(false);
    setMessage('');
    setTimeout(function hideWidget() {
      setIsMinimized(true);
    }, 500);
  }, [setIsMinimized]);

  const shouldRender = isVisible && scrollPercentage >= 50;

  if (!shouldRender && !isMinimized) return null;

  return (
    <AnimatePresence mode="wait">
      {(shouldRender || isMinimized) && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: isMinimized ? 0.7 : 1, 
            y: isMinimized ? 20 : 0,
            scale: isMinimized ? 0.9 : 1,
          }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'w-full max-w-2xl px-4',
            'zen-mode:hidden'
          )}
        >
          {isMinimized ? (
            <motion.button
              onClick={() => setIsMinimized(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'mx-auto flex items-center gap-2 px-4 py-2',
                'rounded-full bg-accent text-accent-foreground',
                'shadow-lg hover:shadow-xl transition-shadow',
                'text-sm font-medium'
              )}
            >
              <ChevronUp className="w-4 h-4" />
              Give Feedback
            </motion.button>
          ) : (
            <div
              className={cn(
                'relative rounded-2xl overflow-hidden',
                'bg-background/95 backdrop-blur-md',
                'border border-border/50 shadow-2xl',
                isExpanded && 'pb-0'
              )}
            >
              <div className="flex items-center justify-between p-3 border-b border-border/30">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {isExpanded ? 'Add your thoughts' : 'Was this helpful?'}
                  </h3>
                  {totalFeedbackCount > 0 && !isExpanded && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {totalFeedbackCount} {totalFeedbackCount === 1 ? 'reaction' : 'reactions'} so far
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    aria-label="Minimize feedback widget"
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    aria-label="Close feedback widget"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {!isExpanded ? (
                <div className="p-4">
                  <div className="flex items-center justify-center gap-3">
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
                          whileHover={{ scale: 1.1, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'relative flex flex-col items-center justify-center',
                            'w-12 h-12 sm:w-14 sm:h-14',
                            'rounded-xl transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2',
                            'focus-visible:ring-accent focus-visible:ring-offset-2',
                            'focus-visible:ring-offset-background',
                            isVoted
                              ? 'bg-accent/20 border-2 border-accent shadow-lg shadow-accent/20'
                              : 'bg-muted/20 border border-border/30 hover:bg-accent/10 hover:border-accent/30',
                            isLoading && 'opacity-50 cursor-wait'
                          )}
                          aria-label={`${isVoted ? 'Remove' : 'Vote'} ${reaction.label || reaction.emoji}`}
                        >
                          <motion.span
                            className="text-xl sm:text-2xl leading-none"
                            animate={isVoted ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {reaction.emoji}
                          </motion.span>

                          <AnimatePresence mode="wait">
                            {reaction.count > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                  'absolute -top-1 -right-1',
                                  'min-w-[20px] h-[20px] px-1',
                                  'flex items-center justify-center',
                                  'text-[10px] font-bold rounded-full',
                                  'shadow-md',
                                  isVoted
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                <AnimatedNumber value={reaction.count} className="font-mono" />
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
                                {reaction.label}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>

                  {userVote && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-xs text-center text-muted-foreground"
                    >
                      Click again to change your vote
                    </motion.p>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 space-y-4"
                >
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts... (optional)"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl resize-none',
                      'bg-muted/30 border border-border/50',
                      'text-sm text-foreground placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50',
                      'transition-all duration-200'
                    )}
                    rows={3}
                    maxLength={280}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={handleSkipMessage}
                      disabled={isSubmitting}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium',
                        'bg-muted/50 text-foreground/80',
                        'hover:bg-muted/70 transition-colors',
                        'disabled:opacity-50'
                      )}
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleSubmitMessage}
                      disabled={isSubmitting}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium',
                        'bg-accent text-accent-foreground',
                        'hover:bg-accent/90 transition-all',
                        'disabled:opacity-50 flex items-center justify-center gap-2',
                        'shadow-md hover:shadow-lg'
                      )}
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
