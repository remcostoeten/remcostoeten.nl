'use client'

import { siteConfig } from "@/core/config"
import { ContactButton } from "@/components/contact-button"
import { Github, Twitter, Mail, Heart, Sparkles } from "lucide-react"

const COMMIT_INFO = process.env.NEXT_PUBLIC_GIT_COMMIT_INFO ?
    JSON.parse(process.env.NEXT_PUBLIC_GIT_COMMIT_INFO) : {
        timestamp: new Date().toISOString(),
        message: "Local development"
    }

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = now.toDateString() === date.toDateString()

    if (isToday) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

export default function Footer() {
    const githubUrl = siteConfig.social.githubUrl
    const twitterUrl = siteConfig.social.twitterUrl
    const timestamp = formatTimestamp(COMMIT_INFO.timestamp)
    const message = COMMIT_INFO.message

    return (
        <footer className="border-t border-border/30 mt-16 relative overflow-hidden">
            {/* Subtle gradient background for flair */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-background/50 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left section - Social links */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                                Let's Connect
                            </h3>

                            <p className="text-[16px] text-foreground/80 leading-relaxed max-w-lg">
                                Find me across the web or reach out directly. I'm always interested in hearing about new projects and ideas.
                            </p>
                        </div>

                        {/* Social links with icons */}
                        <div className="flex flex-wrap gap-4 sm:gap-6">
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300"
                            >
                                <Github className="w-4 h-4 text-foreground/70 group-hover:text-accent transition-colors" />
                                <span className="text-foreground/80 group-hover:text-accent font-medium transition-colors">
                                    GitHub
                                </span>
                            </a>

                            <a
                                href={twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 hover:scale-105"
                            >
                                <Twitter className="w-4 h-4 text-foreground/70 group-hover:text-accent transition-colors" />
                                <span className="text-foreground/80 group-hover:text-accent font-medium transition-colors">
                                    Twitter
                                </span>
                            </a>

                            <ContactButton>
                                Contact
                            </ContactButton>
                        </div>
                    </div>

                    {/* Right section - Build info */}
                    <div className="lg:text-right space-y-4">
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-background/30 px-3 py-1 rounded-full border border-border/20">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Live</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Last updated {timestamp}
                            </p>
                            <p className="text-xs text-muted-foreground/70 italic max-w-xs mx-auto lg:ml-auto lg:mr-0 lg:text-right">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12 pt-8 border-t border-border/20">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Made with
                            <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                            and lots of
                            <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                        </p>

                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Remco Stoeten
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
