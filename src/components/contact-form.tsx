import { MessageSquare, Send, User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { popoverTransition } from "@/lib/animations";

const emojis = ["😊", "🔥", "💡", "👏", "❤️", "🚀"];

type TSubmissionState = 'idle' | 'loading' | 'success' | 'error';

type TProps = {
	isVisible: boolean;
	openAbove?: boolean;
};

export function ContactForm({
	isVisible,
	openAbove = false,
}: TProps) {
	const [formData, setFormData] = useState({
		name: "",
		feedback: "",
		emoji: "",
	});

const [selectedEmoji, setSelectedEmoji] = useState<string>("");
	const [submissionState, setSubmissionState] = useState<TSubmissionState>('idle');

async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmissionState('loading');
		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setSubmissionState('success');
				setFormData({ name: "", feedback: "", emoji: "" });
				setSelectedEmoji("");
				setTimeout(() => setSubmissionState('idle'), 2000);
			} else {
				setSubmissionState('error');
			}
		} catch (error) {
			setSubmissionState('error');
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	}

	function handleEmojiSelect(emoji: string) {
		setSelectedEmoji(emoji);
		setFormData({
			...formData,
			emoji: emoji,
		});
	}

	return (
		<>
			<AnimatePresence initial={false}>
				{isVisible && (
					<motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: openAbove ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: openAbove ? 10 : -10 }}
                transition={popoverTransition}
                className={`absolute z-50 w-80 p-4 bg-popover text-popover-foreground backdrop-blur-lg border border-border rounded-lg shadow-2xl left-0 ${
                    openAbove ? "bottom-full mb-2" : "top-full mt-2"
                }`}
                style={{
                    boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
            >
					{/* Header */}
					<div className="mb-4">
						<h3 className="font-semibold text-foreground text-sm mb-1">
							Quick feedback
						</h3>
						<p className="text-xs text-muted-foreground">
							Got ideas, thoughts, or just want to say hi?
						</p>
					</div>

					{/* Emoji Selection */}
					<div className="mb-4">
						<Label className="text-xs font-medium text-foreground mb-2 block">
							How are you feeling?
						</Label>
						<div className="flex gap-2">
							{emojis.map(function renderEmoji(emoji) {
								return (
									<button
										key={emoji}
										type="button"
										onClick={function selectEmoji() {
											handleEmojiSelect(emoji);
										}}
										className={`text-lg p-2 rounded-md ${
											selectedEmoji === emoji
												? "bg-accent/20 border border-accent/50"
												: "hover:bg-muted/50 border border-transparent"
										}`}
									>
										{emoji}
									</button>
								);
							})}
						</div>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label
								htmlFor="name"
								className="text-xs font-medium text-foreground"
							>
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
							<Label
								htmlFor="feedback"
								className="text-xs font-medium text-foreground"
							>
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

<Button type="submit" className="w-full h-8 text-xs mt-6 flex justify-center items-center">
	{submissionState === 'loading' && <Loader2 className="animate-spin w-3 h-3 mr-2" />}
	{submissionState === 'success' && <CheckCircle className="text-green-500 w-3 h-3 mr-2" />}
	{submissionState === 'error' && <AlertCircle className="text-red-500 w-3 h-3 mr-2" />}
	{submissionState === 'idle' && <Send className="w-3 h-3 mr-1" />}
	{submissionState === 'idle' ? 'Send feedback' : submissionState === 'loading' ? 'Sending...' : submissionState === 'success' ? 'Success' : 'Error'}
</Button>
					</form>

					{/* Footer */}
					<div className="mt-3 pt-3 border-t border-border/30">
						<p className="text-xs text-muted-foreground text-center">
							This is just a demo - no feedback will actually be sent
						</p>
					</div>
				</motion.div>
			)}
</AnimatePresence>
        </>
	);
}
