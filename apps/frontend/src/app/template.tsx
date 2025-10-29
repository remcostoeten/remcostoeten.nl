export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-background text-foreground py-4 sm:py-8 lg:py-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full mx-auto space-y-6 sm:space-y-8">
          {children}
        </div>
      </div>
    </>
  );
}

