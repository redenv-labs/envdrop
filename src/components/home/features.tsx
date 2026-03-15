"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileKey,
  Flame,
  KeyRound,
  Timer,
  Github,
  Lock,
  Unlock,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

const CIPHER_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function ZeroKnowledgeVisual() {
  const originalLines = useMemo(
    () => [
      { key: "DB_HOST", value: "prod.db.internal" },
      { key: "API_KEY", value: "sk_live_9x8h2k" },
      { key: "SECRET", value: "a1b2c3d4e5f6g7h8" },
    ],
    [],
  );

  const [lines, setLines] = useState(() =>
    originalLines.map((l) => ({ key: l.key, value: l.value })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLines(
        originalLines.map((line) => ({
          key: line.key,
          value: line.value
            .split("")
            .map(
              () =>
                CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)],
            )
            .join(""),
        })),
      );
    }, 80);
    return () => clearInterval(interval);
  }, [originalLines]);

  return (
    <div className="w-full max-w-50 space-y-2 rounded-lg border border-border/30 bg-card/80 p-3 font-mono text-[11px]">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-0.5 overflow-hidden">
          <span className="shrink-0 text-muted-foreground/50 select-none">
            {i + 1}
          </span>
          <span className="ml-1.5 shrink-0 text-chart-1">{line.key}</span>
          <span className="shrink-0 text-muted-foreground">=</span>
          <span className="truncate text-primary/70">{line.value}</span>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-1 border-t border-border/20 pt-2">
        <ShieldCheck className="h-2.5 w-2.5 text-primary/50" />
        <span className="text-[9px] text-primary/40">encrypted</span>
      </div>
    </div>
  );
}

function EnvFileVisual() {
  return (
    <div className="relative flex w-full max-w-50 items-center justify-center">
      <div className="relative flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-secondary/10">
        {/* Falling file chip */}
        <motion.div
          animate={{
            y: ["-40%", "10%", "5%"],
            opacity: [0, 1, 1, 1, 0],
            scale: [0.9, 1, 1],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            times: [0, 0.35, 0.5, 0.85, 1],
            ease: "easeInOut",
          }}
          className="absolute"
        >
          <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-3 py-2 shadow-md shadow-black/5">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary/80">
              <FileKey className="h-3 w-3 text-muted-foreground" />
            </div>
            <div>
              <span className="font-mono text-[11px] font-medium text-foreground">
                .env.local
              </span>
              <span className="ml-1.5 font-mono text-[9px] text-muted-foreground">
                1.2kb
              </span>
            </div>
          </div>
        </motion.div>

        {/* Landing pulse */}
        <motion.div
          animate={{ scale: [0, 2, 2.5], opacity: [0.4, 0.1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 1,
            ease: "easeOut",
            repeatDelay: 1.3,
          }}
          className="absolute bottom-4 h-2 w-12 rounded-full bg-primary/30 blur-sm"
        />

        {/* Drop here text */}
        <span className="absolute bottom-2 font-mono text-[9px] text-muted-foreground/40">
          drop here
        </span>
      </div>
    </div>
  );
}

function BurnVisual() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const secretText = "sk_live_a8f3Kx92bQ7n";

  return (
    <div className="relative w-full max-w-50">
      <div className="relative overflow-hidden rounded-lg border border-border/30 bg-card/80 p-3">
        {/* Secret text that burns away */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 overflow-hidden">
            <motion.span
              animate={{
                opacity: phase === 2 ? 0 : 1,
                filter: phase === 2 ? "blur(4px)" : "blur(0px)",
              }}
              transition={{ duration: 0.8 }}
              className="block font-mono text-[11px] text-foreground/80"
            >
              {secretText}
            </motion.span>

            {/* Burn overlay */}
            <motion.div
              animate={{
                scaleX: phase >= 1 ? 1 : 0,
                opacity: phase >= 1 ? 1 : 0,
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 origin-left bg-linear-to-r from-destructive/20 via-destructive/10 to-transparent"
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-2 flex items-center gap-1.5 border-t border-border/20 pt-2">
          <motion.div
            animate={{
              backgroundColor:
                phase === 0
                  ? "var(--chart-1)"
                  : phase === 1
                    ? "var(--destructive)"
                    : "var(--muted-foreground)",
            }}
            className="h-1.5 w-1.5 rounded-full"
          />
          <span className="font-mono text-[9px] text-muted-foreground">
            {phase === 0 ? "viewed" : phase === 1 ? "burning..." : "destroyed"}
          </span>
        </div>
      </div>

      {/* Floating embers */}
      {phase >= 1 &&
        [0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`${phase}-${i}`}
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{
              // eslint-disable-next-line react-hooks/purity
              y: -30 - Math.random() * 20,
              x: (i - 2) * 10,
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0],
            }}
            transition={{
              duration: 1.2,
              delay: i * 0.15,
              ease: "easeOut",
            }}
            className="absolute h-1 w-1 rounded-full bg-destructive/50"
            style={{ bottom: "40%", left: `${20 + i * 15}%` }}
          />
        ))}
    </div>
  );
}

function PasswordVisual() {
  const [locked, setLocked] = useState(true);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (locked) {
      setDots(0);
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev >= 6) {
            setTimeout(() => setLocked(false), 400);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      const timeout = setTimeout(() => setLocked(true), 2000);
      return () => clearTimeout(timeout);
    }
  }, [locked]);

  return (
    <div className="w-full max-w-50">
      <div className="rounded-lg border border-border/30 bg-card/80 p-3">
        {/* Input field */}
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border/50 bg-secondary/30 px-2.5 py-1.5">
          <motion.div
            animate={{ rotate: locked ? 0 : [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            {locked ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Unlock className="h-3 w-3 text-primary" />
            )}
          </motion.div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{
                  scale: i < dots ? 1 : 0,
                  opacity: i < dots ? 1 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                }}
                className="h-1.5 w-1.5 rounded-full bg-foreground/70"
              />
            ))}
            {locked && dots < 6 && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ml-0.5 h-3 w-px bg-foreground/50"
              />
            )}
          </div>
        </div>

        {/* Status */}
        <motion.div
          animate={{ opacity: !locked ? 1 : 0.4 }}
          className="flex items-center gap-1.5"
        >
          <motion.div
            animate={{
              backgroundColor: !locked
                ? "var(--primary)"
                : "var(--muted-foreground)",
            }}
            className="h-1.5 w-1.5 rounded-full"
          />
          <span className="font-mono text-[9px] text-muted-foreground">
            {!locked ? "decrypted" : "locked"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function ExpiryVisual() {
  const [count, setCount] = useState(59);
  const [activeOption, setActiveOption] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 0) {
          setActiveOption((o) => (o + 1) % 3);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const options = ["1h", "24h", "7d"];
  const circumference = 2 * Math.PI * 18;

  return (
    <div className="flex items-center gap-4">
      {/* Timer ring */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2.5"
            opacity="0.3"
          />
          <motion.circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset: circumference - (count / 59) * circumference,
            }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>
        <span className="font-mono text-[11px] font-medium text-foreground tabular-nums">
          {count}
        </span>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <motion.div
            key={opt}
            animate={{
              opacity: i === activeOption ? 1 : 0.3,
              x: i === activeOption ? 2 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5"
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                i === activeOption ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              {opt}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OpenSourceVisual() {
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLine((prev) => (prev + 1) % 5);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const codeLines = [
    {
      tokens: [
        { text: "const ", cls: "text-chart-1" },
        { text: "key", cls: "text-foreground/80" },
        { text: " = ", cls: "text-muted-foreground" },
        { text: "generateKey", cls: "text-foreground/80" },
        { text: "()", cls: "text-muted-foreground" },
      ],
    },
    {
      tokens: [
        { text: "const ", cls: "text-chart-1" },
        { text: "iv", cls: "text-foreground/80" },
        { text: " = ", cls: "text-muted-foreground" },
        { text: "randomBytes", cls: "text-foreground/80" },
        { text: "(12)", cls: "text-muted-foreground" },
      ],
    },
    {
      tokens: [
        { text: "const ", cls: "text-chart-1" },
        { text: "cipher", cls: "text-foreground/80" },
        { text: " = ", cls: "text-muted-foreground" },
        { text: "encrypt", cls: "text-foreground/80" },
        { text: "(data)", cls: "text-muted-foreground" },
      ],
    },
    {
      tokens: [
        { text: "const ", cls: "text-chart-1" },
        { text: "blob", cls: "text-foreground/80" },
        { text: " = ", cls: "text-muted-foreground" },
        { text: "upload", cls: "text-foreground/80" },
        { text: "(cipher)", cls: "text-muted-foreground" },
      ],
    },
    {
      tokens: [
        { text: "return ", cls: "text-chart-1" },
        { text: "{ blob, key }", cls: "text-foreground/80" },
      ],
    },
  ];

  return (
    <div className="w-full max-w-55 rounded-lg border border-border/30 bg-card/80 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-destructive/50" />
        <div className="h-2 w-2 rounded-full bg-chart-1/50" />
        <div className="h-2 w-2 rounded-full bg-ring/50" />
        <span className="ml-1 font-mono text-[8px] text-muted-foreground/50">
          encrypt.ts
        </span>
      </div>
      <div className="space-y-1 font-mono text-[10px] leading-relaxed">
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: i === activeLine ? 1 : 0.35,
              backgroundColor:
                i === activeLine ? "var(--secondary)" : "transparent",
            }}
            transition={{ duration: 0.3 }}
            className="flex gap-1.5 rounded px-1 py-px"
          >
            <span className="w-3 shrink-0 text-right text-muted-foreground/30 select-none">
              {i + 1}
            </span>
            <div className="flex flex-wrap">
              {line.tokens.map((token, j) => (
                <span key={j} className={token.cls}>
                  {token.text}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    icon: ShieldCheck,
    title: "Zero-knowledge",
    description:
      "Encryption happens entirely in your browser. The server stores only encrypted blobs and can never see your data.",
    visual: ZeroKnowledgeVisual,
  },
  {
    icon: FileKey,
    title: ".env file drop",
    description:
      "Drag and drop any .env file. The entire file is encrypted client-side and shared as a single secure link.",
    visual: EnvFileVisual,
  },
  {
    icon: Flame,
    title: "Burn after read",
    description:
      "Secrets self-destruct after being viewed. Once opened, the encrypted blob is permanently deleted.",
    visual: BurnVisual,
  },
  {
    icon: KeyRound,
    title: "Password protection",
    description:
      "Add an extra layer with a password. It is used as additional key material client-side, never sent to the server.",
    visual: PasswordVisual,
  },
  {
    icon: Timer,
    title: "Configurable expiry",
    description:
      "Set secrets to expire after 1 hour, 24 hours, or 7 days. Expired blobs are automatically purged.",
    visual: ExpiryVisual,
  },
  {
    icon: Github,
    title: "Open source",
    description:
      "The core encryption model is fully open source. Audit it, fork it, trust it. Transparency by default.",
    visual: OpenSourceVisual,
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 px-6 py-24">
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
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 transition-colors duration-300 hover:border-border"
            >
              {/* Animated visual area */}
              <div className="flex h-40 items-center justify-center border-b border-border/30 bg-secondary/10 px-5">
                <feature.visual />
              </div>

              {/* Text content */}
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2.5">
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
