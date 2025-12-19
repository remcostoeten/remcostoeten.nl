'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from '@/lib/auth-client';
import { useVimCommand } from '@/hooks/use-vim-command';

const ALLOWED_GITHUB_USERNAME = 'remcostoeten';

interface VimAuthProviderProps {
    children: React.ReactNode;
}

export function VimAuthProvider({ children }: VimAuthProviderProps) {
    const { command, clearCommand } = useVimCommand();
    const { data: session } = useSession();

    useEffect(() => {
        if (command === 'signin' && !session) {
            handleSignIn();
            clearCommand();
        } else if (command === 'signout' && session) {
            handleSignOut();
            clearCommand();
        } else if (command) {
            clearCommand();
        }
    }, [command, session, clearCommand]);

    const handleSignIn = async () => {
        await signIn.social({ provider: 'github' });
    };

    const handleSignOut = async () => {
        await signOut();
    };

    // Check if logged-in user is allowed (only remcostoeten)
    useEffect(() => {
        if (session?.user) {
            // Get GitHub username from the user data
            // If the user's name/email doesn't match remcostoeten, sign them out
            const isAllowed =
                session.user.name?.toLowerCase() === ALLOWED_GITHUB_USERNAME ||
                session.user.email?.toLowerCase().includes(ALLOWED_GITHUB_USERNAME);

            if (!isAllowed) {
                console.warn('Unauthorized user attempted login, signing out...');
                signOut();
            }
        }
    }, [session]);

    return (
        <>
            {children}
            {/* Auth indicator glow for logged-in users */}
            <AuthIndicator isAuthenticated={!!session?.user} />
        </>
    );
}

// Subtle glow indicator for authenticated users
function AuthIndicator({ isAuthenticated }: { isAuthenticated: boolean }) {
    return (
        <AnimatePresence>
            {isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed bottom-4 right-4 z-40"
                    title="Authenticated as remcostoeten"
                >
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 size-3 bg-green-500 rounded-full blur-sm animate-pulse" />
                        {/* Solid dot */}
                        <div className="relative size-3 bg-green-500 rounded-full border border-green-400/50" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Optional: Visual feedback when commands are detected
export function VimCommandFeedback() {
    const { command } = useVimCommand();

    return (
        <AnimatePresence>
            {command && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-mono rounded-none"
                >
                    :{command === 'signin' ? 'signin' : 'signout'}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
