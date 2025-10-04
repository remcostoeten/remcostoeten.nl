'use client';

import { SOCIAL_LINKS } from "@/modules/contact";

export const ContactSection = () => {
  return (
    <section aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="sr-only">Contact Remco Stoeten</h2>
      <p className="text-foreground leading-relaxed text-base">
        Find me on{" "}
        <a 
          href={SOCIAL_LINKS.x} 
          target="_blank" 
          rel="me noopener noreferrer"
          className="inline-block py-1 px-0.5 min-h-[44px] text-accent hover:underline font-medium touch-target"
          aria-label="Follow Remco Stoeten on X (formerly Twitter)"
        >
          X ↗
        </a>{" "}
        and{" "}
        <a 
          href={SOCIAL_LINKS.github} 
          target="_blank" 
          rel="me noopener noreferrer"
          className="inline-block py-1 px-0.5 min-h-[44px] text-accent hover:underline font-medium touch-target"
          aria-label="View Remco Stoeten's GitHub profile"
        >
          GitHub ↗
        </a>{" "}
        or contact me using{" "}
        <a 
          href="mailto:hey@remcostoeten.com" 
          className="inline-block py-1 px-0.5 min-h-[44px] text-accent hover:underline font-medium touch-target"
          aria-label="Email Remco Stoeten"
        >
          E-Mail ↗
        </a>{" "}
        or{" "}
        <a 
          href={SOCIAL_LINKS.telegram} 
          target="_blank" 
          rel="me noopener noreferrer"
          className="inline-block py-1 px-0.5 min-h-[44px] text-accent hover:underline font-medium touch-target"
          aria-label="Message Remco Stoeten on Telegram"
        >
          Telegram ↗
        </a>
        .
      </p>
    </section>
  );
};
