'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/shared/components/link";
import { S } from "./serif";
import { } from "@radix-ui/react-tooltip";

export function HeroSection() {
  return (
    <h1 className="text-heading font-medium text-foreground">
      I, <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            variant="underline"
            size="lg"
            className="font-medium text-foreground hover:text-accent cursor-help"
            onClick={(e) => e.preventDefault()}
          >
            <S i>build</S> a lot<S i>.</S>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          But ship very little.
        </TooltipContent>
      </Tooltip>
    </h1>
  );
};
