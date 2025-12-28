'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Github, Linkedin, Twitter, GitCommit } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useLatestCommit } from '@/hooks/use-github';
import { AnimatedNumber } from '../ui/animated-number';
import { ContactPopover } from '@/components/contact/contact-popover';
import { ResumeDrawer } from '../resume-drawer';

export function Footer() {
  const [copied, setCopied] = useState(false);
  const email = 'stoetenremco.rs@gmail.com';
  const displayEmail = 'stoetenremco [dot] rs [at] gmail [dot] com';


  const { data: latestCommit } = useLatestCommit('remcostoeten', 'remcostoeten.nl');

  const relativeTimeInfo = useMemo(() => {
    if (!latestCommit?.date) return null;
    const now = new Date();
    const date = new Date(latestCommit.date);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return { value: diffMins, unit: diffMins === 1 ? 'min' : 'mins' };
    if (diffHours < 24) return { value: diffHours, unit: diffHours === 1 ? 'hr' : 'hrs' };
    return { value: diffDays, unit: diffDays === 1 ? 'day' : 'days' };
  }, [latestCommit?.date]);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success('Email copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/remcostoeten', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/remcostoeten', icon: Linkedin },
    { name: 'X', href: 'https://x.com/remcostoeten', icon: Twitter },
  ];

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="py-8 md:py-12 max-w-2xl mx-auto w-full border-x border-border/50 px-4 md:px-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-70 transition-opacity">
                remcostoeten<span className="text-primary">.</span>nl
              </Link>
              <button

                onClick={copyEmail}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{displayEmail}</span>
                  </>
                )}
              </button>
            </div>
            {latestCommit && relativeTimeInfo && (
              <a
                href={latestCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitCommit className="w-3 h-3" />
                <span>
                  Updated <AnimatedNumber value={relativeTimeInfo.value} duration={600} initialProgress={0} className="text-foreground" /> {relativeTimeInfo.unit} ago
                </span>
                <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors truncate max-w-[180px]">
                  · {latestCommit.message}
                </span>
              </a>
            )}
          </div>


          <div className="flex items-center gap-4">
            <ContactPopover />

            <span className="text-border">|</span>

            <ResumeDrawer />

            <span className="text-border">|</span>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Remco Stoeten</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};