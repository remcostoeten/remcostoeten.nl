import { API, apiFetch } from '../../config/api.config';

// Types for feedback system
export interface TFeedbackReaction {
  emoji: string;
  count: number;
  label: string;
}

export interface TFeedbackData {
  emoji: string;
  message?: string;
  timestamp: string;
  url: string;
  userAgent?: string;
  ip?: string;
}

export interface TFeedbackStats {
  total: number;
  reactions: TFeedbackReaction[];
  recentFeedback: TFeedbackData[];
}

export interface TUserFeedbackStatus {
  hasSubmitted: boolean;
  lastSubmission?: string;
  submissionId?: string;
}

// Rate limiting configuration
const RATE_LIMITS = {
  SUBMIT: { max: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
  VIEW_REACTIONS: { max: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
};

// Local storage keys for rate limiting and caching
const STORAGE_KEYS = {
  USER_FEEDBACK: (slug: string) => `feedback-${slug}-submitted`,
  RATE_LIMIT: (slug: string) => `feedback-${slug}-rate-limit`,
  REACTIONS_CACHE: (slug: string) => `feedback-${slug}-reactions`,
  LAST_FETCH: (slug: string) => `feedback-${slug}-last-fetch`,
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Check if user has already submitted feedback for this post
 */
export function checkUserFeedbackStatus(slug: string): TUserFeedbackStatus {
  if (typeof window === 'undefined') {
    return { hasSubmitted: false };
  }

  const stored = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACK(slug));
  if (!stored) {
    return { hasSubmitted: false };
  }

  try {
    const data = JSON.parse(stored);
    return {
      hasSubmitted: true,
      lastSubmission: data.timestamp,
      submissionId: data.id,
    };
  } catch {
    return { hasSubmitted: false };
  }
}

/**
 * Check rate limiting for feedback submission
 */
export function checkRateLimit(slug: string): { allowed: boolean; remainingTime?: number } {
  if (typeof window === 'undefined') {
    return { allowed: true };
  }

  const stored = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT(slug));
  if (!stored) {
    return { allowed: true };
  }

  try {
    const data = JSON.parse(stored);
    const now = Date.now();
    const timeSinceLastSubmission = now - data.lastSubmission;

    if (timeSinceLastSubmission >= RATE_LIMITS.SUBMIT.windowMs) {
      // Reset rate limit after window expires
      localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT(slug));
      return { allowed: true };
    }

    const remainingTime = RATE_LIMITS.SUBMIT.windowMs - timeSinceLastSubmission;
    return { allowed: false, remainingTime };
  } catch {
    return { allowed: true };
  }
}

/**
 * Update rate limiting data
 */
function updateRateLimit(slug: string) {
  if (typeof window === 'undefined') return;

  const data = {
    count: 1,
    lastSubmission: Date.now(),
  };

  localStorage.setItem(STORAGE_KEYS.RATE_LIMIT(slug), JSON.stringify(data));
}

/**
 * Check if cached reactions data is still valid
 */
function isCacheValid(slug: string): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(STORAGE_KEYS.LAST_FETCH(slug));
  if (!stored) return false;

  try {
    const lastFetch = JSON.parse(stored);
    return Date.now() - lastFetch < CACHE_DURATION;
  } catch {
    return false;
  }
}

/**
 * Get cached reactions data
 */
function getCachedReactions(slug: string): TFeedbackReaction[] | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEYS.REACTIONS_CACHE(slug));
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Cache reactions data
 */
function setCachedReactions(slug: string, reactions: TFeedbackReaction[]) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.REACTIONS_CACHE(slug), JSON.stringify(reactions));
  localStorage.setItem(STORAGE_KEYS.LAST_FETCH(slug), JSON.stringify(Date.now()));
}

/**
 * Submit feedback for a blog post
 */
export async function submitFeedback(
  slug: string,
  emoji: string,
  message?: string
): Promise<{ success: boolean; error?: string; data?: TFeedbackData }> {
  // Check if user has already submitted
  if (checkUserFeedbackStatus(slug).hasSubmitted) {
    return { success: false, error: 'You have already submitted feedback for this post' };
  }

  // Check rate limiting
  const rateLimit = checkRateLimit(slug);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.remainingTime || 0) / (60 * 1000));
    return { success: false, error: `Rate limit exceeded. Please try again in ${minutes} minutes.` };
  }

  try {
    const feedbackData: Omit<TFeedbackData, 'timestamp'> = {
      emoji,
      message: message?.trim(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    const response = await apiFetch<TFeedbackData>(API.blog.feedback.submit(slug), {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });

    if (response.success && response.data) {
      // Update local storage to mark as submitted
      const submissionData = {
        id: response.data.timestamp, // Use timestamp as ID for simplicity
        timestamp: response.data.timestamp,
      };
      localStorage.setItem(STORAGE_KEYS.USER_FEEDBACK(slug), JSON.stringify(submissionData));

      // Update rate limiting
      updateRateLimit(slug);

      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.error || 'Failed to submit feedback' };
    }
  } catch (error) {
    console.error('Feedback submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get feedback reactions for a blog post
 */
export async function getFeedbackReactions(slug: string): Promise<TFeedbackReaction[]> {
  // Return cached data if valid
  if (isCacheValid(slug)) {
    const cached = getCachedReactions(slug);
    if (cached) return cached;
  }

  try {
    const response = await apiFetch<TFeedbackReaction[]>(API.blog.feedback.reactions(slug));

    if (response.success && response.data) {
      // Cache the reactions data
      setCachedReactions(slug, response.data);
      return response.data;
    } else {
      console.warn('Failed to fetch feedback reactions:', response.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching feedback reactions:', error);
    return [];
  }
}

/**
 * Get comprehensive feedback stats for a blog post
 */
export async function getFeedbackStats(slug: string): Promise<TFeedbackStats | null> {
  try {
    const response = await apiFetch<TFeedbackStats>(API.blog.feedback.get(slug));

    if (response.success && response.data) {
      return response.data;
    } else {
      console.warn('Failed to fetch feedback stats:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return null;
  }
}

/**
 * Clear feedback data for a specific post (for testing/admin purposes)
 */
export function clearFeedbackData(slug: string) {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.USER_FEEDBACK(slug));
  localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT(slug));
  localStorage.removeItem(STORAGE_KEYS.REACTIONS_CACHE(slug));
  localStorage.removeItem(STORAGE_KEYS.LAST_FETCH(slug));
}
