import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const emojis = ["😊", "🔥", "💡", "👏", "❤️", "🚀"] as const;

type TFormData = {
  name: string;
  feedback: string;
  emoji: string;
}

type TProps = {
  isVisible: boolean;
  openAbove?: boolean;
}

// Memoized emoji button component
const EmojiButton = ({ 
  emoji, 
  isSelected, 
  onSelect 
}: { 
  emoji: string; 
  isSelected: boolean; 
  onSelect: (emoji: string) => void;
}) => (
  <motion.button
    type="button"
    onClick={() => onSelect(emoji)}
    className={`text-lg p-2 rounded-none-md transition-colors ${
      isSelected 
        ? 'bg-accent/20 border border-accent/50' 
        : 'hover:bg-muted/50 border border-transparent'
    }`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.15 }}
    aria-label={`Select ${emoji} emoji`}
  >
    {emoji}
  </motion.button>
);

export const ContactForm = ({ 
  isVisible, 
  openAbove = false,
}: TProps) => {
  const [formData, setFormData] = useState<TFormData>({
    name: "",
    feedback: "",
    emoji: ""
  });
  const sendSubmission = useMutation(api.submissions.send);

  // Memoized animation variants
  const animationVariants = useMemo(() => ({
    initial: { opacity: 0, y: openAbove ? -10 : 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: openAbove ? -10 : 10, scale: 0.95 }
  }), [openAbove]);

  // Memoized transition config
  const transition = useMemo(() => ({ 
    duration: 0.3, 
    ease: [0.4, 0.0, 0.2, 1] as const
  }), []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await sendSubmission(formData);
    // Reset form
    setFormData({ name: "", feedback: "", emoji: "" });
    console.log("Feedback submitted:", formData);
  }, [formData, sendSubmission]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setFormData(prev => ({ ...prev, emoji }));
  }, []);

  // Memoized form validation
  const isFormValid = useMemo(() => 
    formData.name.trim() && formData.feedback.trim(), 
    [formData.name, formData.feedback]
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={animationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className={`absolute z-50 w-80 p-4 bg-background/95 backdrop-blur-sm border border-border/50 rounded-none-lg shadow-xl left-0 ${
            openAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header */}
          <header className="mb-4">
            <h3 className="font-semibold text-foreground text-sm mb-1">Quick feedback</h3>
            <p className="text-xs text-muted-foreground">
              Got ideas, thoughts, or just want to say hi?
            </p>
          </header>

          {/* Emoji Selection */}
          <section className="mb-4">
            <Label className="text-xs font-medium text-foreground mb-2 block">
              How are you feeling?
            </Label>
            <div className="flex gap-2" role="group" aria-label="Mood selection">
              {emojis.map((emoji) => (
                <EmojiButton
                  key={emoji}
                  emoji={emoji}
                  isSelected={formData.emoji === emoji}
                  onSelect={handleEmojiSelect}
                />
              ))}
            </div>
          </section>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-foreground">
                Name
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-0 bottom-2 w-3 h-3 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-6 h-8 text-xs bg-transparent border-0 border-b border-border rounded-none-none focus:border-accent focus:ring-0"
                  placeholder="Your name"
                  required
                  aria-describedby="name-error"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-xs font-medium text-foreground">
                What's on your mind?
              </Label>
              <div className="relative mt-1">
                <MessageSquare className="absolute left-0 top-2 w-3 h-3 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  className="pl-6 text-xs min-h-[60px] resize-none bg-transparent border-0 border-b border-border rounded-none-none focus:border-accent focus:ring-0"
                  placeholder="Share your thoughts, ideas, or just say hello..."
                  required
                  aria-describedby="feedback-error"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-8 text-xs mt-6"
              size="sm"
              disabled={!isFormValid}
            >
              <Send className="w-3 h-3 mr-1" aria-hidden="true" />
              Send feedback
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};