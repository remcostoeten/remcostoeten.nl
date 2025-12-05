export function Intro() {
  return (
    <header className="mb-4 animate-enter">
      <div>
        <img
          src="https://github.com/remcostoeten.png"
          alt="Remco Stoeten"
          className="w-16 h-16 rounded-full border-2 border-border/50 mb-4 shadow-sm"
        />
        <h1 className='text-3xl font-bold tracking-tight text-foreground mb-4'>
          Remco Stoeten
        </h1>
        <div className="space-y-3 mb-4 text-muted-foreground w-full">
          <p className="text-lg text-foreground/80 font-medium -mt-4">
            Frontend Engineer
          </p>
          <div className="leading-relaxed space-y-3 text-muted-foreground">
            <p>
              Dutch software engineer focused on front-end development with a background in <span className="text-foreground/80 italic">graphic design</span>.
              <span className="text-foreground/80 italic">8 years</span> of experience across <span className="text-foreground/80 italic decoration-dotted underline underline-offset-4">e-commerce</span>, <span className="text-foreground/80 italic decoration-dotted underline underline-offset-4">SaaS</span>, and <span className="text-foreground/80 italic decoration-dotted underline underline-offset-4">government</span> and <span className="text-foreground/80 italic decoration-dotted underline underline-offset-4">e-learning</span> projects.
            </p>
            <p>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
