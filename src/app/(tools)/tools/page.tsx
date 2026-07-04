import { createPageMetadata } from "@/core/metadata/base";
import { ToolsHub } from "@/features/miscellaneous/components/tools-hub";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Miscellaneous Tools",
  description:
    "A collection of small, browser-based developer utilities. Find & replace, formatters, converters and generators — everything runs client-side.",
  canonical: "/tools",
  keywords: [
    "developer tools",
    "find and replace",
    "text utilities",
    "browser tools",
  ],
});

export default function Page() {
  return <ToolsHub />;
}
