import Link from "next/link";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/"
          className="text-accent hover:underline text-sm mb-4 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Contact</h1>
        <p className="text-muted-foreground">
          Get in touch with me through any of these channels.
        </p>
      </div>

      <div>
        <p className="text-foreground leading-relaxed text-base">
          Find me on{" "}
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            X ↗
          </a>{" "}
          and{" "}
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            GitHub ↗
          </a>{" "}
          or contact me using{" "}
          <a 
            href="mailto:" 
            className="text-accent hover:underline font-medium"
          >
            E-Mail ↗
          </a>{" "}
          or{" "}
          <a 
            href="https://telegram.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            Telegram ↗
          </a>
          .
        </p>
      </div>
    </div>
  );
}