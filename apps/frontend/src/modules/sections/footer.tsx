import { Github, Twitter } from "lucide-react";
import { siteConfig } from "@/config/site";

// This will be populated at build time by Next.js
const COMMIT_INFO = process.env.NEXT_PUBLIC_GIT_COMMIT_INFO ?
    JSON.parse(process.env.NEXT_PUBLIC_GIT_COMMIT_INFO) : {
        timestamp: new Date().toISOString(),
        message: "Local development"
    };

export function Footer() {
    const githubUrl = siteConfig.me.social.github;
    const twitterUrl = siteConfig.me.social.x;

    // Format the timestamp nicely
    const formatTimestamp = (timestamp: string) => {
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
    };

    const timestamp = formatTimestamp(COMMIT_INFO.timestamp);
    const message = COMMIT_INFO.message;

    return (
        <footer className="border-t border-border/30 mt-16">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {/* Social Links Paragraph */}
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Follow me on{" "}
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-foreground hover:text-accent transition-colors duration-200 font-medium"
                            >
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>{" "}
                            to view all my work. I do also have a{" "}
                            <a
                                href={twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-foreground hover:text-accent transition-colors duration-200 font-medium"
                            >
                                <Twitter className="w-4 h-4" />
                                Twitter
                            </a>{" "}
                            account which I barely use but without this paragraph is so empty.
                        </p>
                    </div>

                    {/* Last Update Paragraph */}
                    <div className="pt-4 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                            Last update at {timestamp} - {message}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
