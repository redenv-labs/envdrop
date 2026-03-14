"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  ShieldCheck,
  FileKey,
  Flame,
  KeyRound,
  Timer,
  Github,
} from "lucide-react";
import { useCallback, useRef, type MouseEvent } from "react";

const features = [
  {
    icon: ShieldCheck,
    title: "Zero-knowledge",
    description:
      "Encryption happens entirely in your browser. The server stores only encrypted blobs and can never see your data.",
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
      "Add an extra layer with a password. It is used as additional key material client-side, never sent to the server.",
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
      "The core encryption model is fully open source. Audit it, fork it, trust it. Transparency by default.",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const spotlightBackground = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, var(--primary) 0%, transparent 100%)`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl p-px"
    >
      {/* Animated border glow that follows cursor */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-20"
        style={{ background: spotlightBackground }}
      />

      {/* Static border */}
      <div className="absolute inset-0 rounded-2xl border border-border/50 transition-colors duration-500 group-hover:border-border" />

      {/* Card content */}
      <div className="relative overflow-hidden rounded-2xl bg-card/50 p-7 backdrop-blur-sm transition-colors duration-500 group-hover:bg-card/80">
        {/* Spotlight glow inside */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
        >
          <div className="absolute inset-0 bg-card/90" />
        </motion.div>

        {/* Top shine line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10">
          {/* Icon with animated ring */}
          <div className="relative mb-6">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 transition-all duration-500 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:shadow-lg group-hover:shadow-primary/10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <feature.icon className="h-6 w-6 text-muted-foreground transition-colors duration-500 group-hover:text-foreground" />
            </motion.div>

            {/* Pulse ring behind icon on hover */}
            <div className="absolute -inset-1 rounded-xl bg-primary/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
          </div>

          <h3 className="mb-2.5 text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-foreground">
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">
            {feature.description}
          </p>

          {/* Bottom accent line */}
          <div className="mt-5 h-px w-0 bg-gradient-to-r from-primary/50 to-transparent transition-all duration-700 group-hover:w-full" />
        </div>
      </div>
    </motion.div>
  );
}

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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
