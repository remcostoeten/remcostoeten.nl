'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/shared/components/link";
import { S } from "./serif";

export function HeroSection() {
  return (
    <header role="banner" className="text-2xl"> {/* <- Set base size here */}
      <h1 className="sr-only">
        Remco Stoeten - Software Engineer specializing in React and Next.js
      </h1>

      <div className="text-foreground text-2xl" aria-label="Introduction">
        I, <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              variant="underline"
              className="text-2xl hover:text-accent cursor-help"
              onClick={(e) => e.preventDefault()}
              aria-label="I build a lot of projects"
            >
              <S i>build</S> a lot<S i>.</S>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>But ship very little.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};
