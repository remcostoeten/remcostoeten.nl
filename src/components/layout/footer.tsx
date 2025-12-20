'use client';

import { useState } from "react";
import { Github, Linkedin, ArrowUpRight, ExternalLink } from "lucide-react";

function Footer() {
  const [update] = useState("latest commit message, timestamp placeholder");

  const social = [
    { name: "GitHub", handle: "remcostoeten", href: "https://github.com/remcostoeten", icon: Github },
    { name: "LinkedIn", handle: "/in/remco-stoeten", href: "https://www.linkedin.com/in/remco-stoeten", icon: Linkedin },
  ];

  const quick = [
    { name: "Skriuw", href: "#" },
    { name: "Satio CLI", href: "#" },
    { name: "Servo PM", href: "#" },
    { name: "Kllippy", href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/30 bg-background/95 backdrop-blur-sm pt-16 pb-8">
      <div className="absolute inset-0 bg-gradient-to-t from-muted/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="text-muted-foreground/70 text-sm font-medium tracking-wide uppercase">
                Say hello 👋
              </span>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
                Want to <span className="text-primary">collaborate</span> on something?
              </h2>

              <p className="text-muted-foreground text-base max-w-md leading-relaxed">
                Open for meaningful work, OSS contributions, and long-term collaborations. 
                If the project excites or challenges, I want to hear about it.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-all duration-300 hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99]"
              >
                Start a conversation
                <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
              </a>
            </div>

            <div className="text-xs text-muted-foreground/50 font-mono pt-1">
              latest update: {update}
            </div>
          </div>

          <div className="lg:pt-2 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Projects
              </h3>
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quick.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors"></span>
                    {link.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </a>
                ))}
              </nav>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Follow me
              </h3>
              <div className="flex gap-3">
                {social.map(s => (
                  <a
                    key={s.name}
                    href={s.href}
                    className="group flex items-center justify-center w-10 h-10 rounded-md border border-border/50 text-muted-foreground/70 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                    aria-label={s.name}
                  >
                    <s.icon className="w-4.5 h-4.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xl font-semibold text-foreground">
              <span className="text-muted-foreground">remco</span>
              <span className="text-primary">.</span>
              <span className="text-muted-foreground">stoeten</span>
            </div>

            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Built with intention. Crafted with care.
            </p>

            <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
              <a href="#" className="hover:text-foreground/80 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground/80 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
