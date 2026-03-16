"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  FileText,
  ArrowRight,
} from "lucide-react";
import { importKey, decrypt, deriveKey, hexToBuffer } from "@redenv/e2ee";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "@heroui/spinner";

interface SecretResponse {
  encryptedData: string;
  hasPassword: boolean;
  burnAfterRead: boolean;
  type: "text" | "file";
  fileName?: string;
  fileSize?: number;
  expiresAt: number;
  encryptedKey?: string;
  salt?: string;
}

async function fetchSecret(id: string): Promise<SecretResponse> {
  const { data } = await axios.get<SecretResponse>(`/api/secrets/${id}`);
  return data;
}

export function ViewSecret({ id }: { id: string }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [burned, setBurned] = useState(false);
  const [wasBurnAfterRead, setWasBurnAfterRead] = useState(false);
  const [decrypted, setDecrypted] = useState<{
    plaintext: string;
    type: "text" | "file";
    fileName?: string;
  } | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const burnMutation = useMutation({
    mutationFn: () => axios.delete(`/api/secrets/${id}`),
    onSuccess: () => setBurned(true),
  });

  const hasBurned = useRef(false);
  const burnOnDecrypt = useCallback(() => {
    if (hasBurned.current) return;
    hasBurned.current = true;
    axios.post(`/api/secrets/${id}`).catch(() => {});
  }, [id]);

  const {
    data: secret,
    status,
    error,
  } = useQuery({
    queryKey: ["secret", id],
    queryFn: () => fetchSecret(id),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const decryptWithKey = useCallback(
    async (secretData: SecretResponse) => {
      const keyHex = window.location.hash.slice(1);
      if (!keyHex) {
        setDecryptError("Missing decryption key in URL");
        return;
      }

      setIsDecrypting(true);
      try {
        const key = await importKey(keyHex);
        const plaintext = await decrypt(secretData.encryptedData, key);
        setDecrypted({
          plaintext,
          type: secretData.type,
          fileName: secretData.fileName,
        });
        if (secretData.burnAfterRead) {
          burnOnDecrypt();
        }
      } catch {
        setDecryptError("Failed to decrypt. The link may be invalid.");
      } finally {
        setIsDecrypting(false);
      }
    },
    [burnOnDecrypt],
  );

  // Auto-decrypt non-password secrets once fetched
  if (
    secret &&
    !secret.hasPassword &&
    !decrypted &&
    !decryptError &&
    !isDecrypting
  ) {
    setWasBurnAfterRead(secret.burnAfterRead);
    decryptWithKey(secret);
  }

  const handlePasswordDecrypt = async () => {
    if (!secret || !password) return;

    setIsDecrypting(true);
    setDecryptError(null);
    setWasBurnAfterRead(secret.burnAfterRead);

    try {
      const salt = hexToBuffer(secret.salt!);
      const passwordKey = await deriveKey(password, salt);
      const masterKeyHex = await decrypt(secret.encryptedKey!, passwordKey);
      const masterKey = await importKey(masterKeyHex);
      const plaintext = await decrypt(secret.encryptedData, masterKey);

      setDecrypted({
        plaintext,
        type: secret.type,
        fileName: secret.fileName,
      });
      if (secret.burnAfterRead) {
        burnOnDecrypt();
      }
    } catch {
      setDecryptError("Wrong password. Please try again.");
      setPassword("");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async () => {
    if (!decrypted) return;
    await navigator.clipboard.writeText(decrypted.plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (status === "pending") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16"
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-[28px] bg-primary/3 blur-xl" />
          <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-border/50 bg-card/50 p-10 shadow-lg shadow-black/5 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10 blur-lg" />
              <Spinner size="lg" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Fetching encrypted secret...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Retrieving from secure storage
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Not found / error state
  if (status === "error") {
    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16"
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-[28px] bg-destructive/3 blur-xl" />
          <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-border/50 bg-card/50 p-10 shadow-lg shadow-black/5 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
            >
              {is404 ? (
                <Flame className="h-8 w-8 text-destructive" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </motion.div>
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">
                {is404 ? "Secret not found" : "Something went wrong"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {is404
                  ? "This secret may have been burned after reading, expired, or the link is incorrect."
                  : "We could not fetch the secret. Please check your connection and try again."}
              </p>
            </div>
            <Link
              href="/share"
              className="group mt-2 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Share a new secret
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Decryption error state (non-password)
  if (decryptError && !secret?.hasPassword) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16"
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-[28px] bg-destructive/3 blur-xl" />
          <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-border/50 bg-card/50 p-10 shadow-lg shadow-black/5 backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">Decryption failed</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {decryptError}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Password prompt state
  if (secret?.hasPassword && !decrypted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8"
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-[28px] bg-primary/3 blur-xl" />
          <div className="relative rounded-2xl border border-border/50 bg-card/50 p-8 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  delay: 0.1,
                }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
              >
                <Lock className="h-8 w-8 text-primary" />
              </motion.div>

              <h2 className="mb-2 text-xl font-semibold">
                This secret is locked
              </h2>
              <p className="mb-8 max-w-xs text-sm text-muted-foreground">
                The sender protected this secret with a password. Enter it below
                to decrypt.
              </p>

              <AnimatePresence>
                {decryptError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 w-full max-w-sm overflow-hidden"
                  >
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                      {decryptError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full max-w-sm space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handlePasswordDecrypt()
                    }
                    placeholder="Enter password"
                    autoFocus
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3.5 pr-11 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handlePasswordDecrypt}
                  disabled={!password}
                  className={cn(
                    "group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-all",
                    password
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
                      : "cursor-not-allowed bg-secondary text-muted-foreground",
                  )}
                >
                  {isDecrypting ? <Spinner /> : <Shield className="h-4 w-4" />}
                  Unlock & Decrypt
                  {password && !isDecrypting && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Decrypted state
  if (!decrypted) return null;

  // Burned state after manual burn
  if (burned) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16"
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-[28px] bg-destructive/3 blur-xl" />
          <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-border/50 bg-card/50 p-10 shadow-lg shadow-black/5 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
            >
              <Flame className="h-8 w-8 text-destructive" />
            </motion.div>
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">Secret destroyed</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                This secret has been permanently burned from the server. No one
                can access it again.
              </p>
            </div>
            <Link
              href="/share"
              className="group mt-2 flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Share a new secret
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Main card */}
      <div className="relative">
        <div className="absolute -inset-3 rounded-[28px] bg-primary/3 blur-xl" />
        <div className="relative rounded-2xl border border-border/50 bg-card/50 p-6 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-8">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ring/10">
              <Shield className="h-5 w-5 text-ring" />
            </div>
            <div>
              <p className="text-sm font-semibold">Decrypted successfully</p>
              <p className="text-xs text-muted-foreground">
                Client-side decryption complete
              </p>
            </div>
          </div>

          {/* File info */}
          {decrypted.fileName && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{decrypted.fileName}</p>
                <p className="text-xs text-muted-foreground">Decrypted file</p>
              </div>
            </div>
          )}

          {/* Secret content */}
          <div className="relative rounded-xl border border-border/50 bg-background/50">
            {/* Action bar */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Secret content
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    showSecret
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {showSecret ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      Reveal
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                    copied
                      ? "bg-ring/10 text-ring"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  )}
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
            </div>

            {/* Content area */}
            <div className="p-4">
              <pre
                className={cn(
                  "max-h-96 overflow-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed",
                  showSecret
                    ? "text-foreground"
                    : "text-transparent select-none",
                )}
                style={
                  !showSecret
                    ? { textShadow: "0 0 8px var(--foreground)" }
                    : undefined
                }
              >
                {decrypted.plaintext}
              </pre>
            </div>
          </div>

          {/* Burn after read badge */}
          {wasBurnAfterRead && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5">
              <Flame className="h-4 w-4 text-destructive" />
              <p className="text-xs text-destructive">
                This secret was burned after reading. It no longer exists on the
                server.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Burn button */}
      {!wasBurnAfterRead && (
        <button
          onClick={() => burnMutation.mutate()}
          disabled={burnMutation.isPending}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          {burnMutation.isPending ? (
            <>
              <Spinner size="sm" />
              Burning...
            </>
          ) : (
            <>
              <Flame className="h-4 w-4" />
              Burn this secret now
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
