"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  X,
  Lock,
  Clock,
  Flame,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  Shield,
} from "lucide-react";
import {
  generateRandomKey,
  exportKey,
  encrypt,
  generateSalt,
  deriveKey,
  bufferToHex,
} from "@redenv/e2ee";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

type ExpiryOption = "1h" | "24h" | "7d";

interface EncryptInput {
  plaintext: string;
  burnAfterRead: boolean;
  expiry: ExpiryOption;
  type: "text" | "file";
  fileName?: string;
  fileSize?: number;
  password?: string;
}

async function encryptAndStore(input: EncryptInput): Promise<string> {
  const masterKey = await generateRandomKey();
  const encryptedData = await encrypt(input.plaintext, masterKey);
  const keyHex = await exportKey(masterKey);

  const payload: Record<string, unknown> = {
    encryptedData,
    burnAfterRead: input.burnAfterRead,
    expiry: input.expiry,
    type: input.type,
    ...(input.fileName && { fileName: input.fileName }),
    ...(input.fileSize && { fileSize: input.fileSize }),
  };

  if (input.password) {
    const salt = generateSalt();
    const passwordKey = await deriveKey(input.password, salt);
    const encryptedKey = await encrypt(keyHex, passwordKey);
    payload.encryptedKey = encryptedKey;
    payload.salt = bufferToHex(salt);
  }

  const { data } = await axios.post("/api/secrets", payload);

  const origin = window.location.origin;
  if (input.password) {
    return `${origin}/s/${data.id}`;
  }
  return `${origin}/s/${data.id}#${keyHex}`;
}

interface ShareFormProps {
  droppedFile?: File | null;
  onDroppedFileConsumed?: () => void;
}

export function ShareForm({ droppedFile, onDroppedFileConsumed }: ShareFormProps) {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [secret, setSecret] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [burnAfterRead, setBurnAfterRead] = useState(true);
  const [expiry, setExpiry] = useState<ExpiryOption>("24h");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: encryptAndStore,
    onSuccess: (link) => setShareLink(link),
  });

  // Handle file dropped from full-page drop zone
  useEffect(() => {
    if (droppedFile) {
      setFile(droppedFile);
      setMode("file");
      onDroppedFileConsumed?.();
    }
  }, [droppedFile, onDroppedFileConsumed]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setMode("file");
      }
    },
    []
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setMode("text");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleEncrypt = async () => {
    let plaintext: string;
    if (mode === "file" && file) {
      plaintext = await file.text();
    } else {
      plaintext = secret;
    }

    mutation.mutate({
      plaintext,
      burnAfterRead,
      expiry,
      type: mode,
      ...(mode === "file" && file && {
        fileName: file.name,
        fileSize: file.size,
      }),
      ...(usePassword && password && { password }),
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSecret("");
    setFile(null);
    setPassword("");
    setUsePassword(false);
    setShareLink("");
    setMode("text");
  };

  const hasContent = mode === "text" ? secret.trim().length > 0 : file !== null;

  // Show result view after encryption
  if (shareLink) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">
              Secret encrypted and ready to share
            </span>
          </div>

          {/* Link display */}
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 p-3">
            <span className="flex-1 truncate font-mono text-sm text-foreground/80">
              {shareLink}
            </span>
            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Settings summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {burnAfterRead && (
              <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 font-mono text-[11px] text-destructive">
                <Flame className="h-3 w-3" />
                Burn after read
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Expires in {expiry}
            </span>
            {usePassword && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Password protected
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full rounded-xl border border-border/50 bg-secondary/50 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Share another secret
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex gap-1 rounded-xl border border-border/50 bg-secondary/30 p-1">
        {(["text", "file"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
              mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "text" ? "Paste Secret" : "Drop .env File"}
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
              placeholder="Paste your secret here... API keys, passwords, tokens, connection strings, .env contents..."
              className="h-48 w-full resize-none rounded-2xl border border-border/50 bg-card/50 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
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
              <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/50 bg-card/30 transition-colors hover:border-border hover:bg-card/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
                  <FileUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your .env file here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse
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

      {/* Options */}
      <div className="space-y-4 rounded-2xl border border-border/50 bg-card/30 p-5">
        {/* Burn after read */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Burn after read</p>
              <p className="text-xs text-muted-foreground">
                Destroyed after first view
              </p>
            </div>
          </div>
          <button
            onClick={() => setBurnAfterRead(!burnAfterRead)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              burnAfterRead ? "bg-primary" : "bg-secondary"
            )}
          >
            <motion.div
              animate={{ x: burnAfterRead ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 h-4 w-4 rounded-full bg-primary-foreground shadow-sm"
            />
          </button>
        </div>

        {/* Expiry */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Expiry</p>
              <p className="text-xs text-muted-foreground">
                Auto-delete after time
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg bg-secondary/50 p-0.5">
            {(["1h", "24h", "7d"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setExpiry(opt)}
                className={cn(
                  "rounded-md px-3 py-1 font-mono text-xs transition-all",
                  expiry === opt
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Password protection */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Password protection</p>
                <p className="text-xs text-muted-foreground">
                  Extra layer of security
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUsePassword(!usePassword);
                if (usePassword) setPassword("");
              }}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                usePassword ? "bg-primary" : "bg-secondary"
              )}
            >
              <motion.div
                animate={{ x: usePassword ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 h-4 w-4 rounded-full bg-primary-foreground shadow-sm"
              />
            </button>
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
                <div className="relative mt-3 ml-6.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                    className="w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

      {/* Encrypt button */}
      <button
        onClick={handleEncrypt}
        disabled={!hasContent || mutation.isPending}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-all",
          hasContent
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
            : "cursor-not-allowed bg-secondary text-muted-foreground"
        )}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Encrypting...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Encrypt & Generate Link
          </>
        )}
      </button>

      {/* Trust note */}
      <p className="text-center text-xs text-muted-foreground/60">
        Your secret is encrypted client-side using AES-256-GCM. The server never
        sees your plaintext data.
      </p>
    </div>
  );
}
