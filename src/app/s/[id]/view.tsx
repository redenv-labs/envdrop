"use client";

import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ViewSecret } from "@/components/view/view-secret";

export function ViewSecretView({ id }: { id: string }) {
  return (
    <main className="relative min-h-screen bg-background">
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

      <div className="relative z-10 mx-auto max-w-2xl px-6 pb-20 pt-28">
        {/* Page header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
          >
            <Lock className="h-3.5 w-3.5" />
            Zero-knowledge decryption
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            View a secret
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Decryption happens entirely in your browser. The server never sees
            the plaintext.
          </motion.p>
        </div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ViewSecret id={id} />
        </motion.div>

        {/* Trust indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            AES-256-GCM
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Client-side only
          </span>
        </motion.div>
      </div>
    </main>
  );
}
