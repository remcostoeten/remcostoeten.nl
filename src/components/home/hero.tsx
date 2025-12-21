
import { AnimatedNumber } from '../ui/animated-number';
import Image from 'next/image';

export function Intro() {
  return (
    <header className="animate-enter px-4 md:px-5">
      <div className="flex items-start gap-4 mb-4">
        <Image
          src="/images/remco-stoeten.png"
          alt="Remco Stoeten - Frontend Engineer"
          width={112}
          height={112}
          priority
          className="w-14 h-14 rounded-full border-2 border-border/50 shadow-sm shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Remco Stoeten
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Frontend Engineer
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Dutch software engineer focused on front-end development with a background in{' '}
        <span className="text-foreground/80 italic">graphic design</span>.{' '}
        <span className="font-semibold text-foreground"><AnimatedNumber value={8} duration={2000} priority /> years</span> of experience across{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">e-commerce</span>,{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">SaaS</span>,{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">government</span>, and{' '}
        <span className="text-foreground/80 underline decoration-dotted underline-offset-4">e-learning</span> projects.
      </p>

    </header>
  );
}
