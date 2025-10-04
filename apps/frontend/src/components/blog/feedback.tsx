'use client'

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFeedback } from "../../modules/blog/use-feedback";

interface TFeedbackWidgetProps {
  slug: string;
}

export const FeedbackWidget = ({ slug }: TFeedbackWidgetProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

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
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;
      const scrolledPastThreshold = currentScrollY > 200;

      // Clear previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Show on reverse scroll, hide when scrolling down
      if (scrollingUp && scrolledPastThreshold) {
        setIsVisible(true);
      } else if (!scrollingUp && !isExpanded) {
        setIsVisible(false);
      }

      // Auto-hide after scroll stops (when reading)
      scrollTimeout.current = setTimeout(() => {
        if (!isExpanded && !scrollingUp) {
          setIsVisible(false);
        }
      }, 1500);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [isExpanded]);

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
      {/* Floating emoji bar - always visible */}
      {!isExpanded && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out",
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-16 opacity-0 scale-90 pointer-events-none"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-2 rounded-full",
              "bg-[hsl(var(--feedback-bg))] backdrop-blur-xl",
              "border border-[hsl(var(--feedback-border))]",
              "shadow-lg",
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
                  "w-12 h-12 rounded-full",
                  "transition-all duration-200 ease-out",
                  "hover:bg-[hsl(var(--feedback-hover))] hover:scale-110 active:scale-95",
                  "will-change-transform"
                )}
                style={{
                  animation: isVisible ? `spring-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05}s backwards` : undefined,
                }}
              >
                <span className="text-2xl leading-none">{reaction.emoji}</span>
                {reaction.count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-[hsl(var(--feedback-bg))] bg-[hsl(var(--feedback-glow))] rounded-full">
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
            "fixed bottom-6 right-6 z-50",
            "w-80 rounded-2xl overflow-hidden",
            "bg-[hsl(var(--feedback-bg))] backdrop-blur-xl",
            "border border-[hsl(var(--feedback-border))]",
            "shadow-2xl"
          )}
          style={{
            animation: "spring-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--feedback-border))]">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{selectedEmoji}</span>
            <h3 className="text-sm font-semibold text-foreground">Thanks for the feedback!</h3>
          </div>
          <button
            onClick={() => {
              setIsExpanded(false);
              setSelectedEmoji(null);
              setMessage("");
              resetError();
            }}
            className="p-1 rounded-lg hover:bg-[hsl(var(--feedback-hover))] transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
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
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Want to add more? (optional)</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            className={cn(
              "w-full px-3 py-2 rounded-lg resize-none",
              "bg-[hsl(var(--feedback-hover))] border border-[hsl(var(--feedback-border))]",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--feedback-glow))] focus:ring-opacity-50",
              "transition-all duration-200"
            )}
            rows={3}
            maxLength={280}
          />
          
          <div className="flex gap-2">
            <button
              onClick={handleSkipWrapper}
              disabled={isSubmitting || isRateLimited}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-[hsl(var(--feedback-hover))] text-foreground/80",
                "hover:bg-[hsl(var(--feedback-border))] transition-colors",
                "disabled:opacity-50"
              )}
            >
              Skip
            </button>
            <button
              onClick={handleSubmitWrapper}
              disabled={isSubmitting || isRateLimited}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-[hsl(var(--feedback-glow))] text-[hsl(var(--feedback-bg))]",
                "hover:opacity-90 transition-all",
                "disabled:opacity-50 flex items-center justify-center gap-2",
                "shadow-lg hover:shadow-xl"
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
