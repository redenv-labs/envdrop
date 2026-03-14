"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FileKey, Flame, KeyRound, Timer, Github } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Zero-knowledge",
    description:
      "Encryption happens entirely in your browser. The server stores only encrypted blobs — it can never see your data.",
  },
  {
    icon: FileKey,
    title: ".env file drop",
    description:
      "Drag and drop any .env file. The entire file is encrypted client-side and shared as a single secure link.",
  },
  {
    icon: Flame,
    title: "Burn after read",
    description:
      "Secrets self-destruct after being viewed. Once opened, the encrypted blob is permanently deleted.",
  },
  {
    icon: KeyRound,
    title: "Password protection",
    description:
      "Add an extra layer with a password. It's used as additional key material client-side — never sent to the server.",
  },
  {
    icon: Timer,
    title: "Configurable expiry",
    description:
      "Set secrets to expire after 1 hour, 24 hours, or 7 days. Expired blobs are automatically purged.",
  },
  {
    icon: Github,
    title: "Open source",
    description:
      "The core encryption model is fully open source. Audit it, fork it, trust it — transparency by default.",
  },
];

export function Features() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for developers who care about security
          </h2>
          <p className="text-muted-foreground">
            Every feature designed with zero-trust in mind.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-xl border border-border/50 bg-card/50 p-6 transition-colors hover:bg-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
