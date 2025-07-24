import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMOJIS } from "../constants";
import { TContactFormData } from "../types";

type TProps = {
  isVisible: boolean;
  openAbove?: boolean;
};

export function ContactForm({ isVisible, openAbove = false }: TProps) {
  const [formData, setFormData] = useState<TContactFormData>({
    name: "",
    feedback: "",
    emoji: ""
  });
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted:", formData);
    
    setFormData({ name: "", feedback: "", emoji: "" });
    setSelectedEmoji("");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleEmojiSelect(emoji: string) {
    setSelectedEmoji(emoji);
    setFormData(prev => ({
      ...prev,
      emoji
    }));
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: openAbove ? 10 : -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openAbove ? 10 : -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute left-0 right-0 z-50 ${
            openAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-foreground mb-1">
                  Feedback
                </label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Your feedback..."
                  required
                  className="w-full min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  How do you feel about this? (Optional)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {CONTACT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className={`w-8 h-8 text-lg hover:bg-accent rounded-md transition-colors flex items-center justify-center ${
                        selectedEmoji === emoji ? 'bg-accent' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Send Feedback
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                This is a demo form. No data will be sent.
              </p>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};