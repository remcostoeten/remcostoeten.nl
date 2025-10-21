import { S } from "./serif";

export function HeroSection() {
  return (
    <header role="banner" className="space-y-2">
      <div
        className="text-foreground text-3xl leading-tight"
        aria-label="Introduction"
      >
        <div className="flex flex-col">
          <h1 className="text-foreground text-3xl m-0 p-0">
            <S className="text-foreground text-3xl" i>Remco stoeten,</S>
          </h1>
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