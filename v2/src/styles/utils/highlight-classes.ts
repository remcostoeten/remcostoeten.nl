import { cn } from "~/utilities";

export type THighlightTone =
  | "brand"
  | "accent"
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger";

export type THighlightIntensity = "soft" | "solid" | "outline";
export type THighlightShape = "square" | "rounded" | "pill";
export type THighlightInline = true | false;
export type THighlightPadding = "xs" | "sm" | "md";

export type TBuildHighlightClassNamesOptions = {
  tone?: THighlightTone;
  intensity?: THighlightIntensity;
  shape?: THighlightShape;
  inline?: THighlightInline;
  padding?: THighlightPadding;
  className?: string;
  baseClass?: string;
};

export function buildHighlightClassNames(
  opts: TBuildHighlightClassNamesOptions = {}
): string {
  var base = opts.baseClass || "u-highlight";
  var mods: string[] = [];

  if (opts.tone) mods.push(base + "--tone-" + opts.tone);
  if (opts.intensity) mods.push(base + "--intensity-" + opts.intensity);
  if (opts.shape) mods.push(base + "--shape-" + opts.shape);
  if (typeof opts.inline === "boolean") mods.push(base + (opts.inline ? "--inline" : "--block"));
  if (opts.padding) mods.push(base + "--padding-" + opts.padding);

  return cn(base, mods.join(" "), opts.className);
}

