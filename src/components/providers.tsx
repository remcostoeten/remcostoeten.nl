"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type props = {
    children: React.ReactNode
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function Providers({children}: props) {
    return <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            enableSystem={false}
            storageKey="theme"
            suppressHydrationWarning
    >{children}</ThemeProvider>
}
