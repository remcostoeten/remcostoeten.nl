import { MapPin, Briefcase } from 'lucide-react';

export function Intro() {
  return (
    <header className="animate-enter">
      {/* Profile Section */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src="https://github.com/remcostoeten.png"
          alt="Remco Stoeten"
          className="w-14 h-14 rounded-full border-2 border-border/50 shadow-sm shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Remco Stoeten
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Briefcase className="size-3.5" />
            Frontend Engineer
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Dutch software engineer focused on front-end development with a background in{' '}
        <span className="text-foreground/80 italic">graphic design</span>.{' '}
        <span className="text-foreground/80">8 years</span> of experience across{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">e-commerce</span>,{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">SaaS</span>,{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">government</span>, and{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">e-learning</span> projects.
      </p>
    </header>
  );
}
