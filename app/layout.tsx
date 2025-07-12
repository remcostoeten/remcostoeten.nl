import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from "@/components/providers/query-provider"
import "@/styles/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Remco Stoeten</title>
        <meta
          name="description"
          content="Frontend Developer focused on creating efficient and maintainable web applications. Working remotely from Lemmer, Netherlands."
        />
        <meta name="author" content="Remco Stoeten" />

        <meta property="og:title" content="Remco Stoeten" />
        <meta
          property="og:description"
          content="Frontend Developer focused on creating efficient and maintainable web applications. Working remotely from Lemmer, Netherlands."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@lovable_dev" />
        <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
      </head>
      <body>
        <QueryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
