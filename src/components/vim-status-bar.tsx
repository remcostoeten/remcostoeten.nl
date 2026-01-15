'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { generateRoutes } from '../../tools/dev-menu/utils/generate-routes';

// Define COMMANDS constant as it's used in the new logic but not provided in the original snippet
const COMMANDS = [
    { cmd: 'signin', alias: ['login'], desc: 'Authenticate with GitHub' },
    { cmd: 'signout', alias: ['logout'], desc: 'Sign out' },
    { cmd: 'help', alias: ['?'], desc: 'Show available commands' },
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
    const router = useRouter();

    const currentInput = input.slice(1).toLowerCase();
    const isNavigation = input.startsWith('/');

    const suggestions = useMemo(() => {
        if (!currentInput) {
            if (isNavigation) {
                 // Return all static routes for navigation
                 return generateRoutes()
                    .filter(r => !r.isDynamic)
                    .map(r => ({ cmd: r.path, alias: [r.label], desc: `Go to ${r.label}` }));
            }
            return COMMANDS;
        }

        if (isNavigation) {
             const routes = generateRoutes().filter(r => !r.isDynamic);
             return routes
                .filter(r => r.path.toLowerCase().includes(currentInput) || r.label.toLowerCase().includes(currentInput))
                .map(r => ({ cmd: r.path, alias: [r.label], desc: `Go to ${r.label}` }));
        }

        return COMMANDS.filter(c =>
            c.cmd.startsWith(currentInput) ||
            c.alias.some(a => a.startsWith(currentInput))
        );
    }, [currentInput, isNavigation]);

    const safeSelectedIndex = suggestions.length > 0
        ? Math.max(0, Math.min(selectedIndex, suggestions.length - 1))
        : -1;

    const handleCommand = useCallback((cmd: string) => {
        // If it starts with /, it's a navigation
        if (cmd.startsWith('/')) {
             setIsVisible(false);
             setInput('');
             setMode('normal');
             setSelectedIndex(0);
             router.push(cmd);
             return;
        }

        const normalized = cmd.trim().toLowerCase().replace(/^:/, '').replace(/\s+/g, '');

        setIsVisible(false);
        setInput('');
        setMode('normal');
        setSelectedIndex(0);

        if (onCommand) {
            onCommand(normalized);
        }
    }, [onCommand, router]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Open command bar with :, ;, or /
            if ((e.key === ';' || e.key === ':' || e.key === '/') && !isVisible) {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(true);
                setMode('command');
                // If / pressed, start with /
                setInput(e.key === '/' ? '/' : ':');
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
                     const suggestion = suggestions[safeSelectedIndex];
                     if (suggestion) {
                         // PRESERVE PREFIX (either : or /)
                         // If navigation, the cmd itself starts with /, so we don't need double /?
                         // suggestions for nav map cmd to '/admin'.
                         // So if input is '/', and we select '/admin', we want '/admin'.
                         // If we are in ':', and select 'signin', we want ':signin'.

                         if (isNavigation) {
                             setInput(suggestion.cmd); // suggestion.cmd already has leading /
                         } else {
                             setInput(':' + suggestion.cmd);
                         }
                     }
                     return;
                }

                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIndex(prev => Math.max(0, prev - 1));
                    return;
                }

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
                    return;
                }

                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (input.length > 1) {
                         // Pass raw input if navigation, otherwise slice?
                         // handleCommand logic handles it.
                         // But if input is '/admin', slice(1) -> 'admin'.
                         // If I just pass 'input', handleCommand can check startsWith('/').
                        handleCommand(input);
                    } else if (suggestions.length > 0 && safeSelectedIndex !== -1) {
                        // If enter is pressed on an empty command but with suggestions, use the selected one
                        const suggestion = suggestions[safeSelectedIndex];
                        if (suggestion) {
                            if (isNavigation) {
                                handleCommand(suggestion.cmd);
                            } else {
                                handleCommand(':' + suggestion.cmd);
                            }
                        }
                    }
                    return;
                }

                if (e.key === 'Backspace') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (input.length > 1) {
                        setInput(input.slice(0, -1));
                        setSelectedIndex(0); // Reset selection on backspace
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
                    setSelectedIndex(0); // Reset selection on new input
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isVisible, input, mode, handleCommand, suggestions, safeSelectedIndex, isNavigation]);

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
                    {suggestions.length > 0 && (
                        <div className="container mx-auto px-4 pb-2">
                            <div className="text-xs text-zinc-600 font-mono flex flex-col gap-1">
                                {suggestions.map((s, index) => (
                                    <div
                                        key={s.cmd}
                                        className={`flex gap-2 ${index === safeSelectedIndex ? 'text-green-400' : ''}`}
                                    >
                                        <span className="w-20 flex-shrink-0">{isNavigation ? s.cmd : `:${s.cmd}`}</span>
                                        <span className="text-zinc-700">{s.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {suggestions.length === 0 && (
                        <div className="container mx-auto px-4 pb-2">
                            <div className="text-xs text-zinc-600 font-mono flex gap-4">
                                <span>:signin - Authenticate with GitHub</span>
                                <span>:signout - Sign out</span>
                                <span>ESC - Close</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
