import { useState, useEffect, useCallback } from 'react';
import {
  submitFeedback,
  getFeedbackReactions,
  checkUserFeedbackStatus,
  checkRateLimit,
  TFeedbackReaction,
  TFeedbackStats,
} from './feedback-service';

interface TFeedbackState {
  reactions: TFeedbackReaction[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  isRateLimited: boolean;
  remainingTime?: number;
}

const REACTIONS: TFeedbackReaction[] = [
  { emoji: "🔥", count: 0, label: "Fire" },
  { emoji: "💡", count: 0, label: "Insightful" },
  { emoji: "❤️", count: 0, label: "Love" },
  { emoji: "👏", count: 0, label: "Applause" },
  { emoji: "🤔", count: 0, label: "Thinking" },
];

export function useFeedback(slug: string) {
  const [state, setState] = useState<TFeedbackState & {
    selectedEmoji: string | null;
    isExpanded: boolean;
  }>({
    reactions: REACTIONS,
    isLoading: true,
    error: null,
    isSubmitting: false,
    hasSubmitted: false,
    isRateLimited: false,
    selectedEmoji: null,
    isExpanded: false,
  });

  // Check initial status
  useEffect(() => {
    if (!slug) return;

    const userStatus = checkUserFeedbackStatus(slug);
    const rateLimit = checkRateLimit(slug);

    setState(prev => ({
      ...prev,
      hasSubmitted: userStatus.hasSubmitted,
      isRateLimited: !rateLimit.allowed,
      remainingTime: rateLimit.remainingTime,
    }));

    // Load reactions
    loadReactions();
  }, [slug]);

  const loadReactions = useCallback(async () => {
    if (!slug) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const reactions = await getFeedbackReactions(slug);
      setState(prev => ({
        ...prev,
        reactions: reactions.length > 0 ? reactions : REACTIONS,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading feedback reactions:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load feedback data',
        isLoading: false,
      }));
    }
  }, [slug]);

  const setSelectedEmoji = useCallback((emoji: string | null) => {
    setState(prev => ({ ...prev, selectedEmoji: emoji }));
  }, []);

  const setIsExpanded = useCallback((expanded: boolean) => {
    setState(prev => ({ ...prev, isExpanded: expanded }));
  }, []);

  const handleEmojiClick = useCallback(async (emoji: string) => {
    if (state.hasSubmitted || state.isRateLimited) {
      return;
    }

    setSelectedEmoji(emoji);

    // Optimistically update UI
    const newReactions = state.reactions.map((r) =>
      r.emoji === emoji ? { ...r, count: r.count + 1 } : r
    );

    setState(prev => ({
      ...prev,
      reactions: newReactions,
    }));

    // Show expanded state for message input
    setState(prev => ({ ...prev, isExpanded: true }));
  }, [state.hasSubmitted, state.isRateLimited, state.reactions]);

  const handleSubmit = useCallback(async (message?: string) => {
    if (!slug || state.hasSubmitted || state.isRateLimited || !state.selectedEmoji) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const result = await submitFeedback(slug, state.selectedEmoji, message);

      if (result.success) {
        setState(prev => ({
          ...prev,
          hasSubmitted: true,
          isSubmitting: false,
          isExpanded: false,
          selectedEmoji: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to submit feedback',
          isSubmitting: false,
        }));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred',
        isSubmitting: false,
      }));
    }
  }, [slug, state.hasSubmitted, state.isRateLimited, state.selectedEmoji]);

  const handleSkip = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const retry = useCallback(() => {
    loadReactions();
  }, [loadReactions]);

  return {
    // State
    reactions: state.reactions,
    isLoading: state.isLoading,
    error: state.error,
    isSubmitting: state.isSubmitting,
    hasSubmitted: state.hasSubmitted,
    isRateLimited: state.isRateLimited,
    remainingTime: state.remainingTime,
    selectedEmoji: state.selectedEmoji,
    isExpanded: state.isExpanded,

    // Actions
    handleEmojiClick,
    handleSubmit,
    handleSkip,
    resetError,
    retry,
    setSelectedEmoji,
    setIsExpanded,
  };
}
