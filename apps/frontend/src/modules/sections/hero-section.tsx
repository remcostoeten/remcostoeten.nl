import { S } from "./serif";

export function HeroSection() {
  return (
    <header role="banner" className="space-y-2">
      <h1 className="sr-only">
        Remco Stoeten - Software Engineer specializing in React and Next.js
      </h1>

      <div
        className="text-foreground text-3xl leading-tight"
        aria-label="Introduction"
      >
        <div className="flex flex-col">
          <S className="text-foreground text-3xl" i>Remco stoeten,</S>
          <span className="inline-flex items-baseline gap-1 text-foreground/90 text-base">
            <span>and </span>I<S size="md" i>built</S>

            {/* <span>build </span> */}
            <span>a lot.</span>
          </span>
        </div>
      </div>
    </header >
  );
}