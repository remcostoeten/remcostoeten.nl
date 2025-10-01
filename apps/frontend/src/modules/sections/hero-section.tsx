import { Tooltip, TooltipContent, TooltipTrigger  } from "@/components/ui/tooltip";
import { S } from "./serif";
import {} from "@radix-ui/react-tooltip";

export function HeroSection() {
return (
    <h1 className="text-heading font-medium text-foreground">
      <Tooltip>
        <TooltipTrigger>
          I, <S i>build</S> a lot<S i >.</S>
          <TooltipContent>
            But ship very little.
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </h1>
  );
};
