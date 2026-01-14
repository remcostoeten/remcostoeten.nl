'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from '@/lib/auth-client';
import { VimStatusBar } from '@/components/vim-status-bar';
import { OAuthModal } from '@/components/auth/oauth-modal';
import { useVimCommand } from '@/hooks/use-vim-command';
import { OuterAuthGlow } from '../ui/effects/ouder-auth-glow';
import { env } from '@/server/env';

const ALLOWED_GITHUB_USERNAME = env.ALLOWED_GITHUB_USERNAME;
const ALLOWED_EMAIL = env.ADMIN_EMAIL;

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

    useEffect(() => {
        if (backgroundCommand) {
            handleCommand(backgroundCommand);
            clearBackgroundCommand();
        }
    }, [backgroundCommand, clearBackgroundCommand]);

    useEffect(() => {
        if (session?.user) {
            const isAllowed =
                session.user.name?.toLowerCase() === ALLOWED_GITHUB_USERNAME ||
                (ALLOWED_EMAIL && session.user.email?.toLowerCase().includes(ALLOWED_EMAIL));

            if (!isAllowed) {
                console.warn('Unauthorized user attempted login, signing out...');
                signOut();
            }
        }
    }, [session]);

    return (
        <>
            {children}
            <VimStatusBar onCommand={handleCommand} />

            <OAuthModal
                isOpen={showOAuthModal}
                onClose={() => setShowOAuthModal(false)}
                provider="github"
            />

            {session?.user && <OuterAuthGlow />}
        </>
    );
}

