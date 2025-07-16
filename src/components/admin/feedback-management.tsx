"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	Globe,
	Loader2,
	MessageSquare,
	Monitor,
	Trash2,
	User,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type TFeedbackEntry = {
	id: number;
	name: string;
	message: string;
	emoji: string;
	userAgent: string | null;
	ipAddress: string | null;
	referrer: string | null;
	browser: string | null;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
};

type TProps = {
	onUnreadCountChange?: () => void;
};

function formatDate(dateString: string): string {
	if (!dateString) return "Invalid Date";
	// Handle SQLite CURRENT_TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		// If standard parsing fails, try to parse SQLite format manually
		const sqliteMatch = dateString.match(
			/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/,
		);
		if (sqliteMatch) {
			const [, datePart, timePart] = sqliteMatch;
			const parsedDate = new Date(`${datePart}T${timePart}Z`);
			if (!isNaN(parsedDate.getTime())) {
				return parsedDate.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				});
			}
		}
		return "Invalid Date";
	}
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function FeedbackManagement({ onUnreadCountChange }: TProps) {
	const [feedbacks, setFeedbacks] = useState<TFeedbackEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
	const [refreshing, setRefreshing] = useState(false);

	const fetchFeedbacks = useCallback(async function fetchFeedbacks(isRefresh = false) {
		try {
			if (isRefresh) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);
			const response = await fetch("/api/feedback");
			if (!response.ok) {
				throw new Error("Failed to fetch feedback");
			}
			const data = await response.json();
			setFeedbacks(data);
			if (isRefresh) {
				onUnreadCountChange?.();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch feedback");
		} finally {
			if (isRefresh) {
				setRefreshing(false);
			} else {
				setLoading(false);
			}
		}
	}, [onUnreadCountChange]);

	async function deleteFeedback(id: number) {
		try {
			setDeletingIds((prev) => new Set(prev).add(id));
			const response = await fetch(`/api/feedback/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete feedback");
			}
			// Small delay to show the animation
			await new Promise((resolve) => setTimeout(resolve, 300));
			setFeedbacks(feedbacks.filter((f) => f.id !== id));
			onUnreadCountChange?.();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to delete feedback",
			);
		} finally {
			setDeletingIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	}

	async function markAsRead(id: number) {
		try {
			const response = await fetch(`/api/feedback/${id}/mark-read`, {
				method: "PATCH",
			});
			if (!response.ok) {
				throw new Error("Failed to mark feedback as read");
			}
			setFeedbacks((prev) =>
				prev.map((f) => (f.id === id ? { ...f, isRead: true } : f)),
			);
			onUnreadCountChange?.();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to mark feedback as read",
			);
		}
	}

	useEffect(
		function loadFeedbacks() {
			fetchFeedbacks();
		},
		[fetchFeedbacks],
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<Skeleton className="h-6 w-32 mb-2" />
						<Skeleton className="h-4 w-48" />
					</div>
					<Skeleton className="h-8 w-16" />
				</div>
				<div className="grid gap-4">
					{Array.from({ length: 3 }).map((_, index) => (
						<Card key={index} className="relative">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-4" />
											<Skeleton className="h-5 w-24" />
										</div>
										<Skeleton className="h-6 w-8" />
									</div>
									<Skeleton className="h-8 w-8" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</div>
								<Separator />
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Skeleton className="h-3 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<MessageSquare className="mx-auto h-12 w-12 text-destructive mb-4" />
					<h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
					<p className="text-muted-foreground">{error}</p>
					<Button onClick={() => fetchFeedbacks()} className="mt-4">
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	if (feedbacks.length === 0) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
					<p className="text-muted-foreground">
						No feedback has been submitted yet. Feedback will appear here once
						users submit the contact form.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold">Feedback Entries</h3>
					<p className="text-muted-foreground">
						{feedbacks.length} feedback{" "}
						{feedbacks.length === 1 ? "entry" : "entries"} received
					</p>
				</div>
				<Button
					onClick={() => fetchFeedbacks(true)}
					variant="ghost"
					size="sm"
					disabled={refreshing}
				>
					{refreshing ? (
						<Loader2 className="h-4 w-4 animate-spin mr-2" />
					) : null}
					Refresh
				</Button>
			</div>
			<div className="grid gap-4">
				<AnimatePresence mode="popLayout">
					{feedbacks.map(function renderFeedback(feedback) {
						const isDeleting = deletingIds.has(feedback.id);
						return (
							<motion.div
								key={feedback.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{
									opacity: isDeleting ? 0.5 : 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: -20,
									transition: { duration: 0.3 },
								}}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 30,
								}}
							>
								<Card
									className={
										!feedback.isRead
											? "border-accent bg-accent/10"
											: "hover:bg-secondary/50"
									}
									onClick={() => !feedback.isRead && markAsRead(feedback.id)}
								>
									{isDeleting && (
										<div className="absolute inset-0 bg-destructive/10 z-10 flex items-center justify-center">
											<Loader2 className="h-6 w-6 animate-spin text-destructive" />
										</div>
									)}
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-muted-foreground" />
													<CardTitle>{feedback.name}</CardTitle>
													{!feedback.isRead && (
														<div
															className="w-2 h-2 bg-accent rounded-full"
															title="Unread"
														/>
													)}
												</div>
												{feedback.emoji && (
													<Badge
														variant="accent"
														className="text-accent-foreground text-lg px-2 py-1"
													>
														{feedback.emoji}
													</Badge>
												)}
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => deleteFeedback(feedback.id)}
												className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
												disabled={isDeleting}
											>
												{isDeleting ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4" />
												)}
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										<div className="text-sm text-foreground leading-relaxed">
											{feedback.message}
										</div>
										<div className="shrink-0 bg-border h-[1px] w-full my-4" />
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
											<div className="flex items-center gap-2">
												<Calendar className="h-3 w-3" />
												<span>Submitted: {formatDate(feedback.createdAt)}</span>
											</div>
											{feedback.browser && (
												<div className="flex items-center gap-2">
													<Monitor className="h-3 w-3" />
													<span>Browser: {feedback.browser}</span>
												</div>
											)}
											{feedback.ipAddress && (
												<div className="flex items-center gap-2">
													<Globe className="h-3 w-3" />
													<span>IP: {feedback.ipAddress}</span>
												</div>
											)}
											{feedback.referrer && (
												<div className="flex items-center gap-2">
													<Globe className="h-3 w-3" />
													<span>
														Referrer: {new URL(feedback.referrer).pathname}
													</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}
