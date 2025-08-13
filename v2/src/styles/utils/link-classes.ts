import { cn } from "~/utilities";

export type TLinkTone =
  | "brand"
  | "accent"
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "inherit";

export type TLinkWeight = "regular" | "medium" | "semibold" | "bold";
export type TLinkDecoration = "none" | "underline" | "hover";
export type TLinkSize = "xs" | "sm" | "md" | "lg";
export type TLinkVisited = "auto" | "never";
export type TLinkIcon = "leading" | "trailing" | undefined;
export type TLinkExternal = "on" | "off";

export type TBuildLinkClassNamesOptions = {
  tone?: TLinkTone;
  weight?: TLinkWeight;
  decoration?: TLinkDecoration;
  size?: TLinkSize;
  visited?: TLinkVisited;
  external?: TLinkExternal;
  icon?: TLinkIcon;
  className?: string;
  baseClass?: string;
};

export function buildLinkClassNames(opts: TBuildLinkClassNamesOptions = {}): string {
  var base = opts.baseClass || "u-link";
  var mods: string[] = [];

  if (opts.tone) mods.push(base + "--tone-" + opts.tone);
  if (opts.weight) mods.push(base + "--weight-" + opts.weight);
  if (opts.decoration) mods.push(base + "--decoration-" + opts.decoration);
  if (opts.size) mods.push(base + "--size-" + opts.size);
  if (opts.visited) mods.push(base + "--visited-" + opts.visited);
  if (opts.external === "on") mods.push(base + "--external");
  if (opts.icon === "leading") mods.push(base + "--icon-leading");
  if (opts.icon === "trailing") mods.push(base + "--icon-trailing");

  return cn(base, mods.join(" "), opts.className);
}

