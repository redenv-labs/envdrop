"use client";

import { motion } from "framer-motion";
import { Check, Rocket, Terminal, Users, Bot } from "lucide-react";

const phases = [
  {
    status: "live",
    label: "Live now",
    icon: Check,
    title: "Secret sharing",
    items: [
      "Paste & encrypt secrets",
      ".env file drop",
      "Burn after read",
      "Configurable expiry",
      "Password-protected secrets",
    ],
  },
  {
    status: "next",
    label: "Coming next",
    icon: Users,
    title: "Workspaces & teams",
    items: [
      "User accounts & auth",
      "Team workspaces",
      "Role-based access",
      "Dashboard & history",
    ],
  },
  {
    status: "soon",
    label: "On the horizon",
    icon: Terminal,
    title: "CLI & sync",
    items: [
      "CLI push & pull .env files",
      "Live sync on change",
      "Audit logs",
      "Custom expiry settings",
    ],
  },
  {
    status: "later",
    label: "Future",
    icon: Bot,
    title: "Integrations",
    items: [
      "Slack & Discord bot",
      "REST API for CI/CD",
      "SSO (SAML/OIDC)",
    ],
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="relative scroll-mt-20 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What&apos;s coming
          </h2>
          <p className="text-muted-foreground">
            We&apos;re building in the open. Here&apos;s where we&apos;re headed.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-6 hidden w-px bg-border/50 md:left-1/2 md:block" />

          <div className="space-y-12 md:space-y-16">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col gap-6 md:flex-row md:items-start md:gap-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot on timeline */}
                <div className="absolute left-6 top-0 z-10 hidden md:left-1/2 md:block md:-translate-x-1/2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      phase.status === "live"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <phase.icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Content card */}
                <div
                  className={`flex-1 ${
                    i % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:pl-16 md:text-left"
                  }`}
                >
                  <span
                    className={`mb-2 inline-block rounded-full px-3 py-1 font-mono text-xs ${
                      phase.status === "live"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {phase.label}
                  </span>
                  <h3 className="mb-3 text-xl font-semibold">{phase.title}</h3>
                  <ul
                    className={`space-y-2 ${
                      i % 2 === 0 ? "md:ml-auto" : ""
                    }`}
                  >
                    {phase.items.map((item) => (
                      <li
                        key={item}
                        className={`flex items-center gap-2 text-sm text-muted-foreground ${
                          i % 2 === 0 ? "md:justify-end" : ""
                        }`}
                      >
                        {i % 2 === 0 && (
                          <span className="hidden md:inline">{item}</span>
                        )}
                        <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                        {i % 2 === 0 ? (
                          <span className="md:hidden">{item}</span>
                        ) : (
                          <span>{item}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
