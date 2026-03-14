"use client";

import { ThemeProvider } from "next-themes";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ProgressProvider
        height="3px"
        color="oklch(0.723 0.014 214.4)"
        options={{ showSpinner: false }}
        shallowRouting
      >
        {children}
      </ProgressProvider>
    </ThemeProvider>
  );
}
