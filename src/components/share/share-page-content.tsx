"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Eye,
  Flame,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ShareForm } from "@/components/share/share-form";
import { FullPageDropZone } from "@/components/share/full-page-drop-zone";

const CIPHER = "█▓▒░╳◆◇●○";

function MiniEncryptionDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const cycle = () => {
      setPhase(0);
      setTimeout(() => setPhase(1), 1000);
      setTimeout(() => setPhase(2), 2200);
      setTimeout(() => setPhase(3), 3400);
      setTimeout(() => setPhase(4), 4400);
    };
    cycle();
    const interval = setInterval(cycle, 6000);
    return () => clearInterval(interval);
  }, []);

  const [scramble, setScramble] = useState("");

  useEffect(() => {
    if (phase !== 2) return;
    const interval = setInterval(() => {
      setScramble(
        Array.from({ length: 18 })
          .map(() => CIPHER[Math.floor(Math.random() * CIPHER.length)])
          .join("")
      );
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-lg">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground/50">
          envdrop - encryption flow
        </span>
      </div>

      <div className="space-y-2.5 p-4 font-mono text-xs leading-relaxed">
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2"
          >
            <span className="select-none text-muted-foreground/50">$</span>
            <span>
              <span className="text-chart-1">API_KEY</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-foreground/70">sk_live_8xh2kQ9n</span>
            </span>
          </motion.div>
        )}

        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2"
          >
            <Lock className="mt-0.5 h-3 w-3 shrink-0 text-ring" />
            <span className="text-muted-foreground">
              AES-256-GCM →{" "}
              <span className="text-foreground/40">
                {phase === 2 ? scramble : "▓▒░█▓▒░█▓▒░█▓▒░█▓▒"}
              </span>
            </span>
          </motion.div>
        )}

        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2"
          >
            <Flame className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
            <span className="text-muted-foreground">
              Burn after read: <span className="text-foreground">enabled</span>
            </span>
          </motion.div>
        )}

        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-2 rounded-lg border border-border/30 bg-secondary/20 px-3 py-2"
          >
            <span className="text-muted-foreground">Link ready → </span>
            <span className="text-primary">envdrop.io/s/a8f3k2#key</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-start gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function SharePageContent() {
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const handleFileDrop = useCallback((file: File) => {
    setDroppedFile(file);
  }, []);

  return (
    <main className="relative min-h-screen bg-background">
      <FullPageDropZone onFileDrop={handleFileDrop} />
      <Navbar />

      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-28">
        <div className="grid items-start gap-12 grid-cols-1 lg:grid-cols-2 lg:gap-16">
          {/* Left side — Info & visual */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary-foreground/50 px-4 py-1.5 text-sm text-primary backdrop-blur-sm"
            >
              <Lock className="h-3.5 w-3.5" />
              End-to-end encrypted
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Share a secret
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 max-w-md text-muted-foreground lg:text-lg"
            >
              Everything is encrypted in your browser before it leaves your
              machine. The server never sees the plaintext.
            </motion.p>

            {/* Feature list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 space-y-4"
            >
              <FeatureItem
                icon={Shield}
                title="AES-256-GCM encryption"
                description="Military-grade encryption happens entirely in your browser"
                delay={0.35}
              />
              <FeatureItem
                icon={Eye}
                title="Zero-knowledge architecture"
                description="We never see your data. The decryption key stays in the URL fragment"
                delay={0.45}
              />
              <FeatureItem
                icon={Flame}
                title="Burn after reading"
                description="Secrets auto-destruct after the first view or on expiry"
                delay={0.55}
              />
            </motion.div>

            {/* Mini encryption demo — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden lg:block"
            >
              <MiniEncryptionDemo />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-6 flex items-center gap-5 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ring" />
                Client-side only
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ring" />
                No sign-up
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ring" />
                Open source
              </span>
            </motion.div>
          </div>

          {/* Right side — Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-[28px] bg-primary/3 blur-xl" />
              <div className="relative rounded-2xl border border-border/50 bg-card/50 p-6 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-8">
                <ShareForm
                  droppedFile={droppedFile}
                  onDroppedFileConsumed={() => setDroppedFile(null)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
