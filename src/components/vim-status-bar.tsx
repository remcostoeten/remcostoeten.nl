'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';

const COMMANDS = [
    { cmd: 'signin', alias: ['login'], desc: 'Authenticate with GitHub' },
    { cmd: 'signout', alias: ['logout'], desc: 'Sign out' },
    { cmd: 'hide drafts', alias: ['hidedrafts'], desc: 'Hide draft posts' },
    { cmd: 'hide published', alias: ['hidepublished', 'hide non drafts'], desc: 'Hide published posts' },
    { cmd: 'show all', alias: ['showall', 'show all blogs'], desc: 'Show all posts' },
];

interface VimStatusBarProps {
    onCommand?: (command: string) => void;
}

export function VimStatusBar({ onCommand }: VimStatusBarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'normal' | 'command'>('normal');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { data: session } = useSession();

    const currentInput = input.slice(1).toLowerCase();

    const suggestions = useMemo(() => {
        if (!currentInput) return COMMANDS;
        return COMMANDS.filter(c => 
            c.cmd.startsWith(currentInput) || 
            c.alias.some(a => a.startsWith(currentInput))
        );
    }, [currentInput]);

    const handleCommand = useCallback((cmd: string) => {
        const normalized = cmd.trim().toLowerCase().replace(/^:/, '').replace(/\s+/g, '');

        setIsVisible(false);
        setInput('');
        setMode('normal');
        setSelectedIndex(0);

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
                setSelectedIndex(0);
                return;
            }

            if (e.key === 'Escape' && isVisible) {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(false);
                setInput('');
                setMode('normal');
                setSelectedIndex(0);
                return;
            }

            if (isVisible && mode === 'command') {
                if (e.key === 'Tab' && suggestions.length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    const suggestion = suggestions[selectedIndex];
                    if (suggestion) {
                        setInput(':' + suggestion.cmd);
                    }
                    return;
                }

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
                    return;
                }

                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    return;
                }

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
                        setSelectedIndex(0);
                    } else {
                        setIsVisible(false);
                        setInput('');
                        setMode('normal');
                        setSelectedIndex(0);
                    }
                    return;
                }

                if (e.key.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    setInput(input + e.key);
                    setSelectedIndex(0);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isVisible, input, mode, handleCommand, suggestions, selectedIndex]);

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
                            {suggestions.length > 0 && currentInput && (
                                <span className="text-zinc-600 ml-2">
                                    {suggestions[selectedIndex]?.cmd.slice(currentInput.length)}
                                </span>
                            )}
                        </div>

                        <div className="text-zinc-500 text-xs">
                            {getStatusText()}
                        </div>
                    </div>

                    {suggestions.length > 0 && currentInput && (
                        <div className="container mx-auto px-4 pb-1">
                            <div className="flex flex-wrap gap-2 text-xs font-mono">
                                {suggestions.slice(0, 5).map((s, i) => (
                                    <span 
                                        key={s.cmd}
                                        className={`px-2 py-0.5 ${i === selectedIndex ? 'bg-green-500/20 text-green-400' : 'text-zinc-500'}`}
                                    >
                                        :{s.cmd}
                                    </span>
                                ))}
                                <span className="text-zinc-700 ml-2">Tab to complete</span>
                            </div>
                        </div>
                    )}

                    <div className="container mx-auto px-4 pb-2">
                        <div className="text-xs text-zinc-600 font-mono flex flex-wrap gap-x-4 gap-y-1">
                            <span>:signin - Auth</span>
                            <span>:hide drafts</span>
                            <span>:hide published</span>
                            <span>:show all</span>
                            <span className="text-zinc-700">ESC - Close</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

