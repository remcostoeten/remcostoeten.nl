"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOOL_CATEGORY_LABELS } from "../constants/tools";
import type { TToolDefinition } from "../types";

type Props = {
  tool: TToolDefinition;
};

export function ToolCard({ tool }: Props) {
  const Icon = tool.icon;

  return (
    <article
      aria-labelledby={`tool-${tool.slug}-name`}
      className="group ai-trigger relative h-full flex flex-col gap-3 rounded-none border border-border/50 bg-card p-4 transition-colors hover:border-border"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/60">
          <Icon aria-hidden className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="min-w-0 grow">
        <h3
          id={`tool-${tool.slug}-name`}
          className="text-sm font-medium text-foreground"
        >
          {tool.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="rounded-sm font-normal">
            {TOOL_CATEGORY_LABELS[tool.category]}
          </Badge>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
        >
          <Link href={`/tools/${tool.slug}`}>
            Launch
            <ArrowRight aria-hidden className="size-3" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
