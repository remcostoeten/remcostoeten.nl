import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MapPin, Clock, ExternalLink } from "lucide-react";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact - Remco Stoeten',
  description: 'Get in touch with Remco Stoeten, software engineer specializing in React, Next.js, and TypeScript. Available for freelance projects and collaborations.',
  openGraph: {
    title: 'Contact - Remco Stoeten',
    description: 'Get in touch with Remco Stoeten, software engineer specializing in React, Next.js, and TypeScript.',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link
          href="/"
          className="text-accent hover:underline text-sm mb-4 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Let's work together</h1>
        <p className="text-muted-foreground">
          I'm always interested in discussing new opportunities, collaborations, or just having a chat about technology.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Contact Methods */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Get in touch</h2>

          <div className="grid gap-3">
            <a
              href={`mailto:${siteConfig.me.email}`}
              className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-medium">@</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                  {siteConfig.me.email}
                </div>
                <div className="text-sm text-muted-foreground">Send me an email</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </a>

            <a
              href={`https://x.com/${siteConfig.me.social.x.split('/').pop()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-bold">𝕏</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                  X (Twitter)
                </div>
                <div className="text-sm text-muted-foreground">Follow for updates</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </a>

            <a
              href={siteConfig.me.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-bold">GH</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                  GitHub
                </div>
                <div className="text-sm text-muted-foreground">View my code</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </a>
          </div>
        </div>

        {/* Location & Availability */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Location & Availability</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <MapPin className="w-5 h-5 text-accent" />
              <div>
                <div className="font-medium text-foreground">{siteConfig.me.location}</div>
                <div className="text-sm text-muted-foreground">Based in the Netherlands</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <div className="font-medium text-foreground">Available for freelance</div>
                <div className="text-sm text-muted-foreground">React, Next.js, TypeScript projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">About working together</h2>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              I specialize in building modern web applications with React, Next.js, and TypeScript.
              Whether you need a new project from scratch, help with an existing codebase, or just want
              to discuss ideas, I'm always happy to chat.
            </p>
            <p>
              Currently working at <strong>{siteConfig.company.name}</strong>, but available for
              freelance projects and collaborations that align with my expertise in frontend development
              and developer experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}