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

            // Clear buffer after 2 seconds of inactivity
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (buffer) {
                    console.log('[vim-cmd] Buffer cleared (timeout)');
                }
                setBuffer('');
            }, 2000);

            // Build buffer
            const newBuffer = buffer + e.key.toLowerCase();
            setBuffer(newBuffer);

            // Log the current sequence
            console.log(`[vim-cmd] Sequence: "${newBuffer}"`);

            // Normalize: remove spaces for matching
            const normalized = newBuffer.replace(/\s+/g, '');

            // Check for sign-in patterns: :signin, :sign in, : sign in
            if (normalized.includes(':signin')) {
                console.log('[vim-cmd] ✓ SUCCESS: :signin command detected');
                setCommand('signin');
                setBuffer('');
                return;
            }

            // Check for sign-out patterns: :signout, :sign out, : sign out
            if (normalized.includes(':signout')) {
                console.log('[vim-cmd] ✓ SUCCESS: :signout command detected');
                setCommand('signout');
                setBuffer('');
                return;
            }

            // Limit buffer size
            if (newBuffer.length > 20) {
                console.log('[vim-cmd] Buffer truncated (too long)');
                setBuffer(newBuffer.slice(-15));
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
