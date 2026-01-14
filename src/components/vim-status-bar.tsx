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
        const normalized = cmd.trim().toLowerCase().replace(/^:/, '').replace(/\s+/g, '');

        setIsVisible(false);
        setInput('');
        setMode('normal');

        if (onCommand) {
            onCommand(normalized);
        }
    }, [onCommand]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            if ((e.key === ';' || e.key === ':') && !isVisible) {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(true);
                setMode('command');
                setInput(':');
                return;
            }

            if (e.key === 'Escape' && isVisible) {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(false);
                setInput('');
                setMode('normal');
                return;
            }

            if (isVisible && mode === 'command') {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (input.length > 1) {
                        handleCommand(input.slice(1));
                    }
                    return;
                }

                if (e.key === 'Backspace') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (input.length > 1) {
                        setInput(input.slice(0, -1));
                    } else {
                        setIsVisible(false);
                        setInput('');
                        setMode('normal');
                    }
                    return;
                }

                if (e.key.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    setInput(input + e.key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
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
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-green-500">{input}</span>
                            <span className="w-2 h-4 bg-green-500 animate-pulse" />
                        </div>

                        <div className="text-zinc-500 text-xs">
                            {getStatusText()}
                        </div>
                    </div>
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
