"use client";

import { motion, useInView } from "framer-motion";
import { FileUp, Lock, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const CIPHER = "█▓▒░╳◆◇●○";

function PasteVisual() {
  const fullLines = useMemo(
    () => ["DATABASE_URL=postgres://prod..", "API_KEY=sk_live_8xh2k", "JWT_SECRET=mY5ecR3tK3y!"],
    []
  );
  const [typing, setTyping] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const total = fullLines.join("").length;
    const interval = setInterval(() => {
      setTyping((prev) => (prev >= total + 20 ? 0 : prev + 1));
    }, 45);
    return () => clearInterval(interval);
  }, [fullLines]);

  useEffect(() => {
    let charCount = 0;
    const result: string[] = [];
    for (const line of fullLines) {
      if (typing > charCount + line.length) {
        result.push(line);
      } else if (typing > charCount) {
        result.push(line.slice(0, typing - charCount));
      }
      charCount += line.length;
    }
    setLines(result);
  }, [typing, fullLines]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/40 bg-card/80 shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border/20 px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-destructive/50" />
        <div className="h-2 w-2 rounded-full bg-chart-1/50" />
        <div className="h-2 w-2 rounded-full bg-ring/50" />
        <span className="ml-2 font-mono text-[9px] text-muted-foreground/50">
          paste your secret
        </span>
      </div>
      <div className="h-20 p-3 font-mono text-[11px] leading-relaxed">
        {lines.map((line, i) => {
          const eqIndex = line.indexOf("=");
          return (
            <div key={i} className="flex gap-1.5">
              <span className="w-3 shrink-0 text-right text-muted-foreground/30 select-none">
                {i + 1}
              </span>
              {eqIndex > -1 ? (
                <>
                  <span className="text-chart-1">{line.slice(0, eqIndex)}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-foreground/70">{line.slice(eqIndex + 1)}</span>
                </>
              ) : (
                <span className="text-foreground/70">{line}</span>
              )}
            </div>
          );
        })}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ml-4.5 inline-block h-3.5 w-0.5 bg-primary"
        />
      </div>
    </div>
  );
}

function EncryptVisual() {
  const [phase, setPhase] = useState<"plain" | "encrypting" | "done">("plain");
  const [scramble, setScramble] = useState("");
  const plainText = "sk_live_8xh2kQ9n";

  useEffect(() => {
    const cycle = () => {
      setPhase("plain");
      setTimeout(() => setPhase("encrypting"), 1200);
      setTimeout(() => setPhase("done"), 3200);
    };
    cycle();
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== "encrypting") return;
    const interval = setInterval(() => {
      setScramble(
        Array.from({ length: plainText.length })
          .map(() => CIPHER[Math.floor(Math.random() * CIPHER.length)])
          .join("")
      );
    }, 60);
    return () => clearInterval(interval);
  }, [phase, plainText.length]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/40 bg-card/80 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/20 px-3 py-2">
        <span className="font-mono text-[9px] text-muted-foreground/50">
          AES-256-GCM
        </span>
        <motion.div
          animate={{
            rotate: phase === "encrypting" ? [0, -10, 10, -5, 5, 0] : 0,
            scale: phase === "done" ? [1, 1.15, 1] : 1,
          }}
          transition={{
            duration: phase === "encrypting" ? 0.5 : 0.3,
            repeat: phase === "encrypting" ? Infinity : 0,
          }}
        >
          <Lock
            className={`h-3.5 w-3.5 transition-colors duration-300 ${
              phase === "done" ? "text-primary" : "text-muted-foreground/40"
            }`}
          />
        </motion.div>
      </div>

      <div className="space-y-2.5 p-3">
        {/* Input row */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-2.5 py-1.5">
          <span className="shrink-0 rounded bg-secondary/50 px-1 py-0.5 font-mono text-[7px] uppercase text-muted-foreground/60">
            in
          </span>
          <motion.span
            animate={{
              opacity: phase !== "plain" ? 0.25 : 1,
              filter: phase === "encrypting" ? "blur(3px)" : "blur(0px)",
            }}
            transition={{ duration: 0.4 }}
            className="truncate font-mono text-[10px] text-foreground/80"
          >
            {plainText}
          </motion.span>
        </div>

        {/* Output row */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-2.5 py-1.5">
          <span className="shrink-0 rounded bg-primary/10 px-1 py-0.5 font-mono text-[7px] uppercase text-primary/60">
            out
          </span>
          <span className="truncate font-mono text-[10px] text-primary/70">
            {phase === "plain"
              ? "\u00A0"
              : phase === "encrypting"
                ? scramble
                : "▓▒░█▓▒░█▓▒░█▓▒░█"}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-border/20">
          <motion.div
            animate={{
              width:
                phase === "plain"
                  ? "0%"
                  : phase === "encrypting"
                    ? "65%"
                    : "100%",
            }}
            transition={{
              duration: phase === "encrypting" ? 2 : 0.4,
              ease: "easeOut",
            }}
            className={`h-full rounded-full transition-colors duration-300 ${
              phase === "done" ? "bg-primary" : "bg-primary/60"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function ShareVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const cycle = () => {
      setStep(0);
      setTimeout(() => setStep(1), 1000);
      setTimeout(() => setStep(2), 2000);
    };
    cycle();
    const interval = setInterval(cycle, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/40 bg-card/80 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/20 px-3 py-2">
        <span className="font-mono text-[9px] text-muted-foreground/50">
          secure link
        </span>
        <motion.div
          animate={{
            backgroundColor: step >= 1 ? "var(--primary)" : "var(--muted-foreground)",
          }}
          className="h-1.5 w-1.5 rounded-full"
        />
      </div>

      <div className="space-y-2.5 p-3">
        {/* Link */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-2.5 py-2">
          <Send className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          <motion.span
            animate={{ opacity: step >= 0 ? 1 : 0.3 }}
            className="truncate font-mono text-[10px] text-primary/80"
          >
            {window.location.origin}/s/a8f3k2#key
          </motion.span>
        </div>

        {/* Copy + destinations */}
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{
              scale: step === 1 ? [1, 0.92, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            className={`rounded-md px-2 py-1 font-mono text-[9px] transition-colors duration-300 ${
              step >= 1
                ? "bg-primary/15 text-primary"
                : "bg-secondary/50 text-muted-foreground/50"
            }`}
          >
            {step >= 1 ? "copied!" : "copy"}
          </motion.div>

          <div className="mx-1 h-3 w-px bg-border/30" />

          {["Slack", "Email", "DM"].map((dest, i) => (
            <motion.div
              key={dest}
              animate={{
                opacity: step >= 2 ? 1 : 0.3,
                y: step >= 2 ? 0 : 3,
              }}
              transition={{ duration: 0.3, delay: step >= 2 ? i * 0.08 : 0 }}
              className="rounded-md bg-secondary/30 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground"
            >
              {dest}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "1",
    icon: FileUp,
    title: "Paste or drop",
    description:
      "Paste a secret or drag your .env file. Everything stays in your browser, nothing leaves your machine yet.",
    visual: PasteVisual,
  },
  {
    number: "2",
    icon: Lock,
    title: "Encrypted locally",
    description:
      "Your browser encrypts everything using AES-256-GCM. The encryption key lives only in the URL fragment, never sent to the server.",
    visual: EncryptVisual,
  },
  {
    number: "3",
    icon: Send,
    title: "Share the link",
    description:
      "Send the link over Slack, email, wherever. The recipient's browser decrypts it. The server deletes the blob after.",
    visual: ShareVisual,
  },
];

export function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={sectionRef} className="relative scroll-mt-20 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="text-muted-foreground">
            Three steps. Zero knowledge. No account needed.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="flex flex-col items-center"
            >
              {/* Visual */}
              <div className="mb-5 w-full">
                <step.visual />
              </div>

              {/* Label */}
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold tracking-tight">
                  {step.title}
                </h3>
              </div>

              <p className="max-w-65 text-center text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
