'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, User, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitContactForm } from '@/actions/contact';
import { EmailAutocomplete } from './email-autocomplete';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';

export function ContactPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const toggleOpen = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);

        try {
            const result = await submitContactForm(formData);

            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <button
                onClick={toggleOpen}
                className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors text-sm font-medium",
                    isOpen && "text-foreground"
                )}
            >
                Contact
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-2 w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] z-50 origin-bottom-right"
                    >
                        <div className="bg-popover text-popover-foreground rounded-xl border shadow-xl overflow-hidden p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-primary" />
                                    Get in touch
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close contact form"
                                    className="text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-accent transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                        <input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={cn(
                                                "flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                                errors.name && "border-destructive focus-visible:ring-destructive"
                                            )}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground z-10" />
                                        <EmailAutocomplete
                                            id="email"
                                            value={email}
                                            onValueChange={setEmail}
                                            className={cn(
                                                "pl-9",
                                                errors.email && "border-destructive focus-visible:ring-destructive"
                                            )}
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Subject <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                                    </label>
                                    <input
                                        id="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="Project inquiry"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Message
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            id="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={4}
                                            className={cn(
                                                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none",
                                                errors.message && "border-destructive focus-visible:ring-destructive"
                                            )}
                                            placeholder="How can I help you?"
                                        />
                                    </div>
                                    {errors.message && <p className="text-xs text-destructive">{errors.message[0]}</p>}
                                </div>

                                <input
                                    type="text"
                                    name="_gotcha"
                                    style={{ display: 'none' }}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
