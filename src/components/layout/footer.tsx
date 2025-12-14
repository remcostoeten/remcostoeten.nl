'use client';

import { ArrowUpRight, Github, Linkedin, Mail, Twitter } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-background border-t border-border/30 overflow-hidden">
      {/* Background Grid/Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-[1400px] mx-auto">


        {/* Hero CTA Section */}
        <div className="relative border-b border-border/30">
          {/* Vertical lines for the middle separation look */}
          <div className="absolute top-0 bottom-0 left-0 w-px bg-border/30 hidden md:block" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-border/30 hidden md:block" />
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-border/30 hidden lg:block opacity-30" />
          <div className="absolute top-0 bottom-0 right-1/4 w-px bg-border/30 hidden lg:block opacity-30" />

          <div className="py-24 md:py-32 flex flex-col items-center justify-center text-center relative z-10 px-6">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground mb-12 max-w-2xl mx-auto leading-tight">
              Ready to make your<br />website stand out?
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#E2E673] hover:bg-[#Dbe060] text-black text-sm font-semibold tracking-wide uppercase transition-colors"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start a Project
                {/* Tiny decorative dots */}
                <span className="absolute -top-1 -left-1 size-1 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -top-1 -right-1 size-1 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -bottom-1 -left-1 size-1 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -bottom-1 -right-1 size-1 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.button>
          </div>
        </div>

        {/* Footer Bottom Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/30 text-xs text-muted-foreground">
          <div className="p-6 flex items-center justify-center md:justify-start">
            <span>&copy; {currentYear} Remco Stoeten</span>
          </div>
          <div className="p-6 flex items-center justify-center md:col-span-2 gap-8">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/work" className="hover:text-foreground transition-colors">Work</Link>
            <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div className="p-6 flex items-center justify-center md:justify-end gap-4">
            <Link href="https://github.com/remcostoeten" target="_blank" className="hover:text-foreground transition-colors">
              <Github className="size-4" />
            </Link>
            <Link href="https://linkedin.com/in/remco-stoeten" target="_blank" className="hover:text-foreground transition-colors">
              <Linkedin className="size-4" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-foreground transition-colors">
              <Twitter className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}