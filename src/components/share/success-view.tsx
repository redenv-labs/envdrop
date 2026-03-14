"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Clock,
  Flame,
  Copy,
  Check,
  ArrowRight,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShareFormStore } from "@/stores/share-form-store";

interface SuccessViewProps {
  onReset: () => void;
}

export function SuccessView({ onReset }: SuccessViewProps) {
  const [copied, setCopied] = useState(false);
  const { shareLink, burnAfterRead, expiry, usePassword } = useShareFormStore();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="space-y-6"
    >
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            delay: 0.1,
          }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ring/10"
        >
          <Shield className="h-7 w-7 text-ring" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Encrypted and ready</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this link with your recipient
          </p>
        </div>
      </div>

      {/* Link display */}
      <div className="rounded-xl border border-border/50 bg-secondary/20 p-1.5">
        <div className="flex items-center gap-2 rounded-lg bg-card/80 px-4 py-3">
          <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <a
            href={shareLink}
            target="_blank"
            className="flex-1 truncate font-mono text-sm text-foreground/80 hover:underline"
          >
            {shareLink}
          </a>
          <button
            onClick={handleCopy}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all",
              copied
                ? "bg-ring/10 text-ring"
                : "bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings summary */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {burnAfterRead && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            <Flame className="h-3 w-3" />
            Burns after reading
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" />
          Expires in {expiry}
        </span>
        {usePassword && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Password protected
          </span>
        )}
      </div>

      <button
        onClick={onReset}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/30 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        Share another secret
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
}
