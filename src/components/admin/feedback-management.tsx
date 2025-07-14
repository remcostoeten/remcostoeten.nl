"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Trash2, User, Calendar, Globe, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
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
    createdAt: string;
    updatedAt: string;
};

function formatDate(dateString: string): string {
    if (!dateString) return 'Invalid Date';
    
    // Handle SQLite CURRENT_TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        // If standard parsing fails, try to parse SQLite format manually
        const sqliteMatch = dateString.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
        if (sqliteMatch) {
            const [, datePart, timePart] = sqliteMatch;
            const parsedDate = new Date(`${datePart}T${timePart}Z`);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function FeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState<TFeedbackEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [refreshing, setRefreshing] = useState(false);

    async function fetchFeedbacks(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const response = await fetch('/api/feedback');
            if (!response.ok) {
                throw new Error('Failed to fetch feedback');
            }
            const data = await response.json();
            setFeedbacks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    }

    async function deleteFeedback(id: number) {
        try {
            setDeletingIds(prev => new Set(prev).add(id));
            const response = await fetch(`/api/feedback/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete feedback');
            }
            
            // Small delay to show the animation
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setFeedbacks(feedbacks.filter(f => f.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete feedback');
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    }

    useEffect(function loadFeedbacks() {
        fetchFeedbacks();
    }, []);

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
                            <CardHeader className="pb-3">
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
                            <CardContent className="space-y-4">
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
                    <MessageSquare className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
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
                        No feedback has been submitted yet. Feedback will appear here once users submit the contact form.
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
                        {feedbacks.length} feedback {feedbacks.length === 1 ? 'entry' : 'entries'} received
                    </p>
                </div>
                <Button 
                    onClick={() => fetchFeedbacks(true)} 
                    variant="outline" 
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
                                    scale: isDeleting ? 0.95 : 1
                                }}
                                exit={{ 
                                    opacity: 0, 
                                    y: -20, 
                                    scale: 0.9,
                                    transition: { duration: 0.3 }
                                }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 300, 
                                    damping: 30 
                                }}
                            >
                                <Card className="relative overflow-hidden">
                                    {isDeleting && (
                                        <div className="absolute inset-0 bg-red-500/10 z-10 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                                        </div>
                                    )}
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-base">{feedback.name}</CardTitle>
                                        </div>
                                        {feedback.emoji && (
                                            <Badge variant="secondary" className="text-lg px-2 py-1">
                                                {feedback.emoji}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteFeedback(feedback.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                            
                            <CardContent className="space-y-4">
                                <div className="text-sm text-foreground leading-relaxed">
                                    {feedback.message}
                                </div>
                                
                                <Separator />
                                
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
                                            <span>Referrer: {new URL(feedback.referrer).pathname}</span>
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
