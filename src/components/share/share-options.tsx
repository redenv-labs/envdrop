"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, Flame, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShareFormStore } from "@/stores/share-form-store";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        enabled ? "bg-primary" : "bg-secondary",
      )}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-primary-foreground shadow-sm"
      />
    </button>
  );
}

export function ShareOptions() {
  const {
    burnAfterRead,
    setBurnAfterRead,
    expiry,
    setExpiry,
    usePassword,
    setUsePassword,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
  } = useShareFormStore();

  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-xs font-medium text-muted-foreground/50">
          OPTIONS
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="space-y-1">
        {/* Burn after read */}
        <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <Flame className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium">Burn after read</p>
              <p className="text-xs text-muted-foreground">
                Destroyed after first view
              </p>
            </div>
          </div>
          <Toggle
            enabled={burnAfterRead}
            onToggle={() => setBurnAfterRead(!burnAfterRead)}
          />
        </div>

        {/* Expiry */}
        <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
              <Clock className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-sm font-medium">Expiry</p>
              <p className="text-xs text-muted-foreground">
                Auto-delete after time
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg border border-border/50 bg-secondary/30 p-0.5">
            {(["1h", "24h", "3d"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setExpiry(opt)}
                className={cn(
                  "relative rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-all",
                  expiry === opt
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {expiry === opt && (
                  <motion.div
                    layoutId="expiry-bg"
                    className="absolute inset-0 rounded-md bg-background/50 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Password protection */}
        <div>
          <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ring/10">
                <Lock className="h-4 w-4 text-ring" />
              </div>
              <div>
                <p className="text-sm font-medium">Password protection</p>
                <p className="text-xs text-muted-foreground">
                  Require a password to decrypt
                </p>
              </div>
            </div>
            <Toggle
              enabled={usePassword}
              onToggle={() => setUsePassword(!usePassword)}
            />
          </div>

          <AnimatePresence>
            {usePassword && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative mb-2 px-3 pl-14">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                    className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    onClick={toggleShowPassword}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
