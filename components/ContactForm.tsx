"use client"

import type React from "react"

import { useState } from "react"
import { Send, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const emojis = ["😊", "🔥", "💡", "👏", "❤️", "🚀"]

interface ContactFormProps {
  isVisible: boolean
  openAbove?: boolean
}

export const ContactForm = ({ isVisible, openAbove = false }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    feedback: "",
    emoji: "",
  })

  const [selectedEmoji, setSelectedEmoji] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This is a dummy form - just reset the form
    setFormData({ name: "", feedback: "", emoji: "" })
    setSelectedEmoji("")
    console.log("Feedback submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    setFormData({
      ...formData,
      emoji: emoji,
    })
  }

  return (
    <>
      {isVisible && (
        <div
          className={`absolute z-50 w-80 p-4 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl left-0 ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm mb-1">Quick feedback</h3>
            <p className="text-xs text-muted-foreground">Got ideas, thoughts, or just want to say hi?</p>
          </div>

          {/* Emoji Selection */}
          <div className="mb-4">
            <Label className="text-xs font-medium text-foreground mb-2 block">How are you feeling?</Label>
            <div className="flex gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`text-lg p-2 rounded-md ${
                    selectedEmoji === emoji
                      ? "bg-accent/20 border border-accent/50"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-foreground">
                Name
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-0 bottom-2 w-3 h-3 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-6 h-8 text-xs bg-transparent border-0 border-b border-border rounded-none focus:border-accent focus:ring-0"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-xs font-medium text-foreground">
                What's on your mind?
              </Label>
              <div className="relative mt-1">
                <MessageSquare className="absolute left-0 top-2 w-3 h-3 text-muted-foreground" />
                <Textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  className="pl-6 text-xs min-h-[60px] resize-none bg-transparent border-0 border-b border-border rounded-none focus:border-accent focus:ring-0"
                  placeholder="Share your thoughts, ideas, or just say hello..."
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-8 text-xs mt-6" size="sm">
              <Send className="w-3 h-3 mr-1" />
              Send feedback
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              This is just a demo - no feedback will actually be sent
            </p>
          </div>
        </div>
      )}
    </>
  )
}
