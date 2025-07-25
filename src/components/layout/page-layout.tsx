import { ReactNode } from "react";

type TProps = {
  children: ReactNode;
};

export function PageLayout({ children }: TProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-8">
        {children}
      </div>
    </div>
  );
}
