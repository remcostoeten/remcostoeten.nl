import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageSquare, X } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/shared/utilities/cn";

const emojis = ["😊", "🔥", "💡", "👏", "❤️", "🚀"] as const;

type TFormData = {
  name: string;
  feedback: string;
  emoji: string;
}

type TProps = {
  isVisible: boolean;
  openAbove?: boolean;
  onPanelEnter?: () => void;
  onPanelLeave?: () => void;
}



export function ContactPopover({
  isVisible,
  openAbove = false,
  onPanelEnter,
  onPanelLeave
}: TProps) {
  const [formData, setFormData] = useState<TFormData>({ name: "", feedback: "", emoji: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const sendSubmission = useMutation(api.submissions.send);
  const emojiCounts = useQuery(api.submissions.getEmojiCounts) ?? {};

  const animationVariants = useMemo(() => ({
    initial: { opacity: 0, y: openAbove ? -12 : 12, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: openAbove ? -12 : 12, scale: 0.96 }
  }), [openAbove]);

  const transition = useMemo(() => ({ duration: 0.2, ease: [0.23, 1, 0.32, 1] as const }), []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.feedback.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await sendSubmission({ 
        name: formData.name.trim(), 
        feedback: formData.feedback.trim(),
        emoji: formData.emoji || undefined
      });
      setIsSuccess(true);
      setFormData({ name: "", feedback: "", emoji: "" });
      setTimeout(() => { setIsSuccess(false); }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send feedback");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, sendSubmission]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }, [error]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setFormData(prev => ({ ...prev, emoji: prev.emoji === emoji ? "" : emoji }));
  }, []);


  const isFormValid = useMemo(() => formData.name.trim() && formData.feedback.trim(), [formData.name, formData.feedback]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={popoverRef}
          variants={animationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          onMouseEnter={onPanelEnter}
          onMouseLeave={onPanelLeave}
          className={`
            absolute z-[100] w-80 
            bg-card border border-border
            rounded-lg shadow-lg
            ${openAbove ? 'bottom-full mb-2' : 'top-full mt-2'}
            left-0
          `}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground text-sm">Send feedback</h3>
            </div>

            <div className="mb-4">
              <Label className="text-xs font-medium text-foreground mb-2 block">How are you feeling? (optional)</Label>
              <div className="flex gap-2 flex-wrap">
                {emojis.map((emoji) => {
                  const count = emojiCounts[emoji] || 0;
                  const isSelected = formData.emoji === emoji;
                  return (
                    <span key={emoji} className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className={cn(
                          "relative text-lg p-2 rounded-lg transition-colors border",
                          isSelected
                            ? "bg-accent/10 border-accent text-accent"
                            : "border-border hover:border-accent/50 hover:bg-accent/5"
                        )}
                        aria-label={`${emoji} (${count} submission${count !== 1 ? 's' : ''})`}
                      >
                        {emoji}
                      </button>
                      {count > 0 && (
                        <span className={cn(
                          "absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1",
                          "bg-accent text-[10px] font-medium leading-none text-background pointer-events-none"
                        )}>
                          {count}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium text-foreground">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 h-9 text-sm bg-input border-border focus:border-ring transition-colors"
                    placeholder="Your name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-xs font-medium text-foreground">Message</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="feedback"
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleInputChange}
                    className="pl-10 pt-3 text-sm min-h-[72px] resize-none bg-input border-border focus:border-ring transition-colors"
                    placeholder="Your message..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded p-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-9 text-sm"
                disabled={!isFormValid || isSubmitting}
                size="sm"
              >
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.span key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Sent!
                    </motion.span>
                  ) : isSubmitting ? (
                    <motion.div key="submitting" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <motion.div 
                        className="w-3 h-3 border-2 border-current border-t-transparent rounded-full" 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                      />
                      <span>Sending...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="default" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
