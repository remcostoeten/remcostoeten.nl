export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-6 sm:space-y-8">
        {children}
      </div>
    </div>
  );
}

