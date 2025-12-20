'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';

interface VimStatusBarProps {
    onCommand?: (command: string) => void;
}

export function VimStatusBar({ onCommand }: VimStatusBarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'normal' | 'command'>('normal');
    const { data: session } = useSession();

    const handleCommand = useCallback((cmd: string) => {
        const trimmed = cmd.trim().toLowerCase();

        // Close the status bar
        setIsVisible(false);
        setInput('');
        setMode('normal');

        // Execute command
        if (onCommand) {
            onCommand(trimmed);
        }
    }, [onCommand]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Semicolon to open command mode
            if (e.key === ';' && !isVisible) {
                e.preventDefault();
                setIsVisible(true);
                setMode('command');
                setInput(':');
                return;
            }

            // Escape to close
            if (e.key === 'Escape' && isVisible) {
                e.preventDefault();
                setIsVisible(false);
                setInput('');
                setMode('normal');
                return;
            }

            // Handle input when visible
            if (isVisible && mode === 'command') {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (input.length > 1) {
                        handleCommand(input.slice(1)); // Remove the ':'
                    }
                    return;
                }

                if (e.key === 'Backspace') {
                    e.preventDefault();
                    if (input.length > 1) {
                        setInput(input.slice(0, -1));
                    } else {
                        setIsVisible(false);
                        setInput('');
                        setMode('normal');
                    }
                    return;
                }

                // Add character to input
                if (e.key.length === 1) {
                    e.preventDefault();
                    setInput(input + e.key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, input, mode, handleCommand]);

    const getStatusText = () => {
        if (session?.user) {
            return `-- AUTHENTICATED -- ${session.user.name || session.user.email}`;
        }
        return '-- NORMAL --';
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/95 border-t border-zinc-800 backdrop-blur-sm"
                >
                    <div className="container mx-auto px-4 py-2 flex items-center justify-between font-mono text-sm">
                        {/* Left: Command input */}
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-green-500">{input}</span>
                            <span className="w-2 h-4 bg-green-500 animate-pulse" />
                        </div>

                        {/* Right: Status */}
                        <div className="text-zinc-500 text-xs">
                            {getStatusText()}
                        </div>
                    </div>

                    {/* Command hints */}
                    <div className="container mx-auto px-4 pb-2">
                        <div className="text-xs text-zinc-600 font-mono flex gap-4">
                            <span>:signin - Authenticate with GitHub</span>
                            <span>:signout - Sign out</span>
                            <span>ESC - Close</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
