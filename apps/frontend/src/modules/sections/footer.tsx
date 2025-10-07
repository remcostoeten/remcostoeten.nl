'use client';

import { siteConfig } from "@/config/site";
import { ContactPopover } from "@/components/contact-popover";

const COMMIT_INFO = process.env.NEXT_PUBLIC_GIT_COMMIT_INFO ?
    JSON.parse(process.env.NEXT_PUBLIC_GIT_COMMIT_INFO) : {
        timestamp: new Date().toISOString(),
        message: "Local development"
    };

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

export function Footer() {
    const githubUrl = siteConfig.me.social.github;
    const twitterUrl = siteConfig.me.social.x;
    const timestamp = formatTimestamp(COMMIT_INFO.timestamp);
    const message = COMMIT_INFO.message;

    return (
        <footer className="border-t border-border/30 mt-16">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="space-y-4">
                    <p className="text-[16px] text-foreground leading-relaxed">
                        Find me on{" "}
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline font-medium"
                        >
                            GitHub
                        </a>
                        ,{" "}
                        <a
                            href={twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline font-medium"
                        >
                            Twitter
                        </a>
                        {" "}or{" "}
                        <ContactPopover>
                            <button className="text-accent hover:underline font-medium cursor-pointer">
                                contact me here
                            </button>
                        </ContactPopover>
                        .
                    </p>

                    <div className="pt-2 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                            Last update at {timestamp} - {message}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
