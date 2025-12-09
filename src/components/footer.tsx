'use client'

import { useEffect, useState } from 'react';
import { Sparkles, Github, Linkedin, Mail, ArrowUpRight, GitCommitHorizontal, Heart } from 'lucide-react';
import Link from 'next/link';

type TSocialLink = {
  href: string;
  icon: typeof Github;
  label: string;
};

type TCommitInfo = {
  hash: string;
  message: string;
  timeAgo: string;
  url: string;
};

type TProps = {
  socialLinks?: TSocialLink[];
  commitInfo?: TCommitInfo;
  statusOnline?: boolean;
  copyrightYear?: number;
  authorName?: string;
};

function Footer({
  socialLinks = [
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
    { href: 'http://linkedin.com/in/remco-stoeten', icon: Linkedin, label: 'LinkedIn' }
  ],
  commitInfo = {
    hash: 'demo123',
    message: 'feat: improve remcostoeten.nl functionality',
    timeAgo: '7 minutes ago',
    url: 'https://github.com/remcostoeten/remcostoeten.nl/commits/main'
  },
  statusOnline = true,
  copyrightYear = 2025,
  authorName = 'Remco Stoeten'
}: TProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  function handleContactClick() {
    window.location.href = 'mailto:contact@example.com';
  }

  const stagger = (index: number, baseDelay = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + index * 80}ms`,
  });

  return (
    <footer className="border-t border-border/30 mt-16 relative overflow-hidden w-full group/footer">
      <div className="absolute -top-[25%] -left-0 w-full h-[150%] pointer-events-none overflow-hidden will-change-transform">
        <div className="absolute top-[5%] left-[5%] w-[500px] h-[500px] bg-accent/10 blur-[120px] animate-pulse mix-blend-screen" />
        <div className="absolute top-[15%] right-[5%] w-[400px] h-[400px] bg-accent/5 blur-[90px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 blur-[140px] animate-pulse mix-blend-screen" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold text-foreground flex items-center gap-2"
                style={stagger(0)}
              >
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                Let's Connect
              </h3>
              <p 
                className="text-[16px] text-foreground/80 leading-relaxed max-w-lg"
                style={stagger(1)}
              >
                Find me across the web or reach out directly. I'm always interested in hearing about new projects and ideas.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 active:scale-95 overflow-hidden"
                    style={stagger(index, 150)}
                  >
                    <Icon className="w-4 h-4 text-foreground/70 group-hover:text-accent transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <span className="text-foreground/80 group-hover:text-accent font-medium transition-colors duration-300">
                      {link.label}
                    </span>
                    <div className="relative w-3.5 h-3.5 ml-1 overflow-hidden">
                      <ArrowUpRight className="absolute inset-0 w-3.5 h-3.5 text-foreground/40 group-hover:text-accent transition-all duration-500 group-hover:-translate-y-full group-hover:translate-x-full" />
                      <ArrowUpRight className="absolute inset-0 w-3.5 h-3.5 text-accent -translate-x-full translate-y-full transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                  </a>
                );
              })}

              <button
                onClick={handleContactClick}
                className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 active:scale-95 overflow-hidden"
                style={stagger(socialLinks.length, 150)}
              >
                <Mail className="w-4 h-4 text-foreground/70 group-hover:text-accent transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                <span className="text-foreground/80 group-hover:text-accent font-medium transition-colors duration-300">
                  Contact
                </span>
                <div className="relative w-3.5 h-3.5 ml-1 overflow-hidden">
                  <ArrowUpRight className="absolute inset-0 w-3.5 h-3.5 text-foreground/40 group-hover:text-accent transition-all duration-500 group-hover:-translate-y-full group-hover:translate-x-full" />
                  <ArrowUpRight className="absolute inset-0 w-3.5 h-3.5 text-accent -translate-x-full translate-y-full transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
              </button>
            </div>
          </div>

          <div className="lg:text-right space-y-4">
            <div className="space-y-2 flex flex-col lg:items-end">
              <Link
                href={commitInfo.url}
                target="_blank"
                rel="noreferrer"
                className="group/commit block"
                style={stagger(1, 200)}
              >
                <p className="text-xs font-mono text-accent/80 group-hover/commit:text-accent transition-colors mb-1 flex items-center lg:justify-end gap-1.5">
                  <GitCommitHorizontal className="w-3 h-3" />
                  {commitInfo.hash}
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-0 -translate-x-1 translate-y-1 group-hover/commit:opacity-100 group-hover/commit:translate-x-0 group-hover/commit:translate-y-0 transition-all" />
                </p>
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-2 max-w-[200px] lg:text-right">
                  {commitInfo.message}
                </p>
              </Link>
              <p 
                className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium"
                style={stagger(2, 200)}
              >
                Updated {commitInfo.timeAgo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;