'use client'

import { useState, useEffect, useRef } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFeedback } from "../../modules/blog/use-feedback";

interface TFeedbackWidgetProps {
  slug: string;
}

export const FeedbackWidget = ({ slug }: TFeedbackWidgetProps) => {
  const [isVisible, setIsVisible] = useState(true); // Always visible for now
  const [message, setMessage] = useState("");
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    reactions,
    isLoading,
    error,
    isSubmitting,
    hasSubmitted,
    isRateLimited,
    remainingTime,
    selectedEmoji,
    isExpanded,
    handleEmojiClick,
    handleSubmit,
    handleSkip,
    resetError,
    setSelectedEmoji,
    setIsExpanded,
  } = useFeedback(slug);

  useEffect(() => {
    // Simplified scroll logic - show after scrolling down a bit
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledPastThreshold = currentScrollY > 300;

      if (scrolledPastThreshold) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Show immediately if already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleEmojiClickWrapper = (emoji: string) => {
    // Trigger emoji pop animation
    const emojiElement = document.querySelector(`[data-emoji="${emoji}"]`);
    emojiElement?.classList.add("animate-emoji-pop");
    setTimeout(() => {
      emojiElement?.classList.remove("animate-emoji-pop");
    }, 400);

    // Call hook's handler
    handleEmojiClick(emoji);
  };

  const handleSubmitWrapper = async () => {
    await handleSubmit(message.trim() || undefined);
    if (!error) {
      // Hide widget after successful submission
      setTimeout(() => {
        setIsVisible(false);
        setMessage("");
      }, 800);
    }
  };

  const handleSkipWrapper = () => {
    handleSkip();
    if (!error) {
      setTimeout(() => {
        setIsVisible(false);
        setMessage("");
      }, 800);
    }
  };

  return (
    <>
      {/* Integrated feedback widget */}
      {!isExpanded && (
        <div className="w-full">
          <div
            className={cn(
              "flex items-center justify-center gap-4 p-6 rounded-2xl",
              "bg-muted/30 border border-border/50",
              "hover:bg-muted/40 transition-all duration-300",
              "will-change-transform"
            )}
          >
            {reactions.map((reaction, idx) => (
              <button
                key={reaction.emoji}
                data-emoji={reaction.emoji}
                disabled={isLoading || hasSubmitted || isRateLimited}
                onClick={() => handleEmojiClickWrapper(reaction.emoji)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "w-16 h-16 rounded-2xl",
                  "transition-all duration-200 ease-out",
                  "hover:bg-accent/10 hover:scale-105 active:scale-95",
                  "hover:shadow-lg hover:shadow-accent/20",
                  "will-change-transform"
                )}
                style={{
                  animation: isVisible ? `spring-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05}s backwards` : undefined,
                }}
              >
                <span className="text-2xl leading-none">{reaction.emoji}</span>
                {reaction.count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[11px] font-bold text-background bg-accent rounded-full shadow-md">
                    {reaction.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded message panel */}
      {isExpanded && (
        <div
          className={cn(
            "w-full rounded-2xl overflow-hidden",
            "bg-background border border-border/50 shadow-lg"
          )}
          style={{
            animation: "spring-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{selectedEmoji}</span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Thanks for the feedback!</h3>
                <p className="text-sm text-muted-foreground">Help us improve this post</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                setSelectedEmoji("");
                setMessage("");
                resetError();
              }}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Rate limit message */}
          {isRateLimited && (
            <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
              <div className="text-sm text-yellow-400">
                <span>Rate limit exceeded. Please try again in {Math.ceil((remainingTime || 0) / (60 * 1000))} minutes.</span>
              </div>
            </div>
          )}

          {/* Optional message field */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Want to add more? (optional)</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              className={cn(
                "w-full px-4 py-4 rounded-xl resize-none",
                "bg-muted/30 border border-border/50",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
                "transition-all duration-200"
              )}
              rows={4}
              maxLength={280}
            />

            <div className="flex gap-4">
              <button
                onClick={handleSkipWrapper}
                disabled={isSubmitting || isRateLimited}
                className={cn(
                  "flex-1 px-6 py-3 rounded-xl text-sm font-medium",
                  "bg-muted/50 text-foreground/80",
                  "hover:bg-muted/70 transition-colors",
                  "disabled:opacity-50"
                )}
              >
                Skip
              </button>
              <button
                onClick={handleSubmitWrapper}
                disabled={isSubmitting || isRateLimited}
                className={cn(
                  "flex-1 px-6 py-3 rounded-xl text-sm font-medium",
                  "bg-accent text-accent-foreground",
                  "hover:bg-accent/90 transition-all",
                  "disabled:opacity-50 flex items-center justify-center gap-2",
                  "shadow-md hover:shadow-lg"
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
          </div>
        </div>
      )}
    </>
  );
};
