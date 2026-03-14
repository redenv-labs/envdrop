"use client";

import { Shield, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold tracking-tight">
                EnvDrop
              </span>
            </div>
            <p className="max-w-[260px] text-center text-sm text-muted-foreground md:text-left">
              Zero-knowledge encrypted secret sharing for developers. Your browser encrypts. The server knows nothing.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="mb-3 text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">Share a Secret</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Drop a .env</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-medium">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="transition-colors hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Security</a></li>
                <li><a href="#" className="transition-colors hover:text-foreground">Open Source</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 md:flex-row">
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EnvDrop by Redenv Labs. All rights reserved.
          </span>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
