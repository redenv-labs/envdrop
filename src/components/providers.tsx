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
        height="4px"
        color="#fffd00"
        options={{ showSpinner: false }}
        shallowRouting
      >
        {children}
      </ProgressProvider>
    </ThemeProvider>
  );
}
