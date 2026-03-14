"use client";

import { motion } from "framer-motion";
import { FileUp, Lock, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileUp,
    title: "Paste or drop",
    description:
      "Paste a secret or drag your .env file. Everything stays in your browser, nothing leaves your machine yet.",
  },
  {
    number: "02",
    icon: Lock,
    title: "Encrypted locally",
    description:
      "Your browser encrypts everything using AES-256-GCM. The encryption key lives only in the URL fragment, never sent to the server.",
  },
  {
    number: "03",
    icon: Send,
    title: "Share the link",
    description:
      "Send the link over Slack, email, wherever. The recipient's browser decrypts it. The server deletes the blob after.",
  },
];

export function HowItWorks() {
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
            How it works
          </h2>
          <p className="text-muted-foreground">
            Three steps. Zero knowledge. No account needed.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="pointer-events-none absolute top-16 right-[calc(16.67%+1rem)] left-[calc(16.67%+1rem)] hidden h-px bg-border/50 md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step circle */}
              <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-border/50 bg-card" />
                <div className="absolute inset-2 rounded-full border border-border/30 bg-secondary/30" />
                <step.icon className="relative z-10 h-8 w-8 text-foreground" />
              </div>

              {/* Step number */}
              <span className="mb-2 font-mono text-xs text-muted-foreground">
                {step.number}
              </span>

              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
