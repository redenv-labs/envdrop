"use client";

import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShareFormStore } from "@/stores/share-form-store";

export function SecretInput() {
  const { mode, setMode, secret, setSecret, file, setFile } =
    useShareFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setMode("file");
      }
    },
    [setFile, setMode],
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setMode("text");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setFile, setMode]);

  return (
    <>
      {/* Mode tabs */}
      <div className="flex gap-1 rounded-xl bg-secondary/50 p-1">
        {(["text", "file"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
              mode === m
                ? "text-foreground"
                : "text-muted-foreground/60 hover:text-muted-foreground",
            )}
          >
            {mode === m && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg border border-border/50 bg-background/50 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {m === "text" ? (
                <FileText className="h-4 w-4" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              {m === "text" ? "Paste Secret" : "Upload File"}
            </span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        {mode === "text" ? (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Paste your secret here...&#10;&#10;API keys, passwords, tokens, connection strings, .env contents..."
              className="h-48 w-full resize-none rounded-xl border border-border/50 bg-background/50 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {file ? (
              <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/50 bg-background/30 transition-all hover:border-primary/30 hover:bg-primary/2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-secondary/50 transition-colors group-hover:border-primary/20 group-hover:bg-primary/10">
                  <FileUp className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Click to browse or drag a file anywhere
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    .env, .env.local, .txt files supported
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".env,.env.local,.env.production,.env.development,.txt"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
