'use client';

import { useEffect, useState, useCallback } from 'react';

type VimCommand = 'signin' | 'signout' | null;

/**
 * Hook that listens for Vim-style commands typed anywhere on the page.
 * Supports:
 * - :signin, :sign in, : sign in (triggers sign-in)
 * - :signout, :sign out, : sign out (triggers sign-out)
 */
export function useVimCommand() {
    const [command, setCommand] = useState<VimCommand>(null);
    const [buffer, setBuffer] = useState('');

    const clearCommand = useCallback(() => {
        setCommand(null);
    }, []);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Escape key resets the buffer
            if (e.key === 'Escape') {
                if (buffer) {
                    console.log('[vim-cmd] Buffer cleared (Escape pressed)');
                    setBuffer('');
                }
                return;
            }

            // Only start capturing if we see a ':' or if we're already capturing
            if (!buffer && e.key !== ':') {
                return;
            }

            // Also ignore non-character keys (Enter, Shift, etc. except Escape and Backspace which we handle)
            if (e.key.length > 1 && e.key !== 'Escape' && e.key !== 'Backspace') {
                return;
            }

            // Clear buffer after 2 seconds of inactivity
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (buffer) {
                    console.log('[vim-cmd] Buffer cleared (timeout)');
                    setBuffer('');
                }
            }, 2000);

            // Build buffer
            const char = e.key.toLowerCase();
            const newBuffer = buffer + char;
            setBuffer(newBuffer);

            // ONLY log if we're in command mode (buffer exists)
            console.log(`[vim-cmd] Sequence: "${newBuffer}"`);

            // Normalize: remove spaces for matching
            const normalized = newBuffer.replace(/\s+/g, '');

            // Check for sign-in patterns: :signin, :sign in, :login
            if (normalized.includes(':signin') || normalized.includes(':login')) {
                console.log('[vim-cmd] ✓ SUCCESS: :signin/:login command detected');
                setCommand('signin');
                setBuffer('');
                return;
            }

            // Check for sign-out patterns: :signout, :sign out, :logout
            if (normalized.includes(':signout') || normalized.includes(':logout')) {
                console.log('[vim-cmd] ✓ SUCCESS: :signout/:logout command detected');
                setCommand('signout');
                setBuffer('');
                return;
            }

            // Limit buffer size - if it gets too long without a match, it's likely not a command
            if (newBuffer.length > 20) {
                console.log('[vim-cmd] Buffer cleared (no match)');
                setBuffer('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeout);
        };
    }, [buffer]);

    return { command, clearCommand };
}
