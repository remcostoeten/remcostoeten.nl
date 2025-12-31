'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from '@/lib/auth-client';
import { VimStatusBar } from '@/components/vim-status-bar';
import { OAuthModal } from '@/components/auth/oauth-modal';
import { useVimCommand } from '@/hooks/use-vim-command';
import { OuterAuthGlow } from '../ui/effects/ouder-auth-glow';

const ALLOWED_GITHUB_USERNAME = 'remcostoeten';

type Props = {
    children: React.ReactNode;
}

export function VimAuthProvider({ children }: Props) {
    const { data: session } = useSession();
    const [showOAuthModal, setShowOAuthModal] = useState(false);
    const { command: backgroundCommand, clearCommand: clearBackgroundCommand } = useVimCommand();

    const handleCommand = async (command: string) => {
        const cmd = command.toLowerCase().trim();

        if ((cmd === 'signin' || cmd === 'login') && !session) {
            // Show the modal
            setShowOAuthModal(true);
        } else if ((cmd === 'signout' || cmd === 'logout') && session) {
            await signOut();
        }
    };

    // Handle commands from the background listener (:signin typed anywhere)
    useEffect(() => {
        if (backgroundCommand) {
            handleCommand(backgroundCommand);
            clearBackgroundCommand();
        }
    }, [backgroundCommand, clearBackgroundCommand]);

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
            {/* Vim status bar */}
            <VimStatusBar onCommand={handleCommand} />

            {/* OAuth modal */}
            <OAuthModal
                isOpen={showOAuthModal}
                onClose={() => setShowOAuthModal(false)}
                provider="github"
            />

            {/* Auth indicator glow for logged-in users */}
            {session?.user && <OuterAuthGlow />}
        </>
    );
}

