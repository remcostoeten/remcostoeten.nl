import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from "@/components/providers/query-provider"
import AdminToggleListener from "@/components/admin-toggle-listener"
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
        <meta property="og:image" content="/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@remcostoeten" />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body>
        <QueryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AdminToggleListener />
            {children}
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'Next.js'
    };
