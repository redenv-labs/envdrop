"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Github,
  ExternalLink,
  Terminal,
  Sparkles,
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "Share a Secret", href: "#" },
    { label: "Drop a .env", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Security", href: "#" },
    { label: "Open Source", href: "#", external: true },
  ],
  social: [
    { label: "GitHub", href: "#", external: true },
  ],
};

const stats = [
  { icon: Shield, label: "Zero-Knowledge", value: "E2E Encrypted" },
  { icon: Terminal, label: "CLI First", value: "Developer Friendly" },
  { icon: Sparkles, label: "Open Source", value: "MIT License" },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });

  return (
    <footer ref={footerRef} className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 80px,
              currentColor 80px,
              currentColor 81px
            )`,
          }}
        />
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.06,transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Top gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Stats banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="hidden grid-cols-3 divide-x divide-border/10 py-10 md:grid"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex items-center justify-center gap-4 px-6"
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-xl bg-primary/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative rounded-xl border border-border/50 bg-secondary/30 p-3 transition-colors group-hover:border-border">
                  <stat.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground/70">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/30 to-transparent" />

        {/* Links section */}
        <div className="py-16">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-8">
            {/* Brand column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-2 md:col-span-5"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-2xl bg-primary/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    EnvDrop
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    by{" "}
                    <a
                      href="https://redenvlabs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:underline"
                    >
                      Redenv Labs
                    </a>
                  </p>
                </div>
              </div>

              <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground/60">
                Zero-knowledge encrypted secret sharing for developers. Your
                browser encrypts. The server knows nothing.
              </p>

              {/* Distribution badges */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/50 px-3 py-2 transition-all hover:border-border hover:bg-secondary/60"
                >
                  <Github className="h-4 w-4 text-foreground/70 transition-colors group-hover:text-foreground" />
                  <span className="text-xs text-foreground/70 transition-colors group-hover:text-foreground">
                    GitHub
                  </span>
                </a>
              </div>
            </motion.div>

            {/* Spacer */}
            <div className="hidden md:col-span-1 md:block" />

            {/* Link columns */}
            {Object.entries(footerLinks)
              .filter(([category]) => category !== "social")
              .map(([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + categoryIndex * 0.1,
                  }}
                  className="col-span-1 md:col-span-3"
                >
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/70">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={
                            (link as { external?: boolean }).external
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            (link as { external?: boolean }).external
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground/75 transition-colors hover:text-muted-foreground"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-muted-foreground/75 transition-all duration-300 group-hover:w-full" />
                          </span>
                          {(link as { external?: boolean }).external && (
                            <ExternalLink className="h-2.5 w-2.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-50" />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/30 to-transparent" />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            <span>
              &copy; {new Date().getFullYear()}{" "}
              <a
                className="text-foreground/70 hover:underline"
                href="https://redenvlabs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Redenv Labs
              </a>
            </span>
            <span className="hidden text-muted-foreground/50 sm:inline">
              &bull;
            </span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </footer>
  );
}
