"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Eye, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const ENCRYPTED_CHARS = "█▓▒░╳╱╲◆◇○●";

function useDecryptText(finalText: string, delay: number = 0) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let iteration = 0;
      const maxIterations = finalText.length * 2;

      const interval = setInterval(() => {
        setText(
          finalText
            .split("")
            .map((char, i) => {
              if (char === " ") return " ";
              if (i < iteration / 2) return char;
              return ENCRYPTED_CHARS[
                Math.floor(Math.random() * ENCRYPTED_CHARS.length)
              ];
            })
            .join("")
        );
        iteration++;
        if (iteration > maxIterations) {
          clearInterval(interval);
          setText(finalText);
          setDone(true);
        }
      }, 10);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [finalText, delay]);

  return { text, done };
}

function TerminalWindow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 2600),
      setTimeout(() => setStep(4), 3400),
      setTimeout(() => setStep(5), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="relative mx-auto w-full max-w-2xl"
    >
      {/* Glow effect behind terminal */}
      <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl">
        {/* Terminal header */}
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-destructive/70" />
          <div className="h-3 w-3 rounded-full bg-chart-1/70" />
          <div className="h-3 w-3 rounded-full bg-ring/70" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            envdrop - zero-knowledge sharing
          </span>
        </div>

        {/* Terminal content */}
        <div className="space-y-3 p-5 font-mono text-sm leading-relaxed">
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <span className="select-none text-muted-foreground">$</span>
              <span className="text-foreground">
                echo <span className="text-chart-1">&quot;DB_PASSWORD=s3cret_k3y_2024&quot;</span>
              </span>
            </motion.div>
          )}

          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ring" />
              <span className="text-muted-foreground">
                Encrypting client-side with AES-256-GCM...
              </span>
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <span className="text-muted-foreground">
                Burn after read: <span className="text-foreground">enabled</span>
              </span>
            </motion.div>
          )}

          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-1" />
              <span className="text-muted-foreground">
                Server stores:{" "}
                <span className="text-foreground/50">
                  ▓▒░█▓▒░█▓▒░█▓▒░█▓▒
                </span>{" "}
                <span className="text-muted-foreground italic">(encrypted blob)</span>
              </span>
            </motion.div>
          )}

          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-4 rounded-lg border border-border/50 bg-secondary/30 px-4 py-3"
            >
              <span className="text-muted-foreground">Link ready → </span>
              <span className="text-primary underline decoration-primary/30 underline-offset-2">
                {window.location.origin}/s/a8f3k2#decryptionKey
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const headline = useDecryptText("Stop sharing secrets in plaintext.", 200);

  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pt-32 pb-20">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
        >
          <Lock className="h-3.5 w-3.5" />
          Zero-knowledge encryption
        </motion.div>

        {/* Headline with decrypt animation */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="font-mono text-foreground/90">
            {headline.text}
          </span>
          {!headline.done && (
            <span className="ml-1 inline-block h-[1em] w-0.75 animate-pulse bg-primary align-middle" />
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Paste a secret or drop a <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-foreground">.env</code> file.
          Everything encrypts in your browser. The server never sees it.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/share" className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
            Share a Secret
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/share" className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Drop a .env File
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ring" />
            Client-side encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ring" />
            Burn after read
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ring" />
            Open source
          </span>
        </motion.div>
      </div>

      {/* Terminal demo */}
      <div className="relative z-10 mt-16 w-full max-w-3xl pb-20">
        <TerminalWindow />
      </div>
    </section>
  );
}
