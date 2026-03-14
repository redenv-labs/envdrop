"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { importKey, decrypt, deriveKey, hexToBuffer } from "@redenv/e2ee";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

interface SecretResponse {
  encryptedData: string;
  hasPassword: boolean;
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
  const [decrypted, setDecrypted] = useState<{
    plaintext: string;
    type: "text" | "file";
    fileName?: string;
  } | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const { data: secret, status, error } = useQuery({
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
      } catch {
        setDecryptError("Failed to decrypt. The link may be invalid.");
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  // Auto-decrypt non-password secrets once fetched
  if (secret && !secret.hasPassword && !decrypted && !decryptError && !isDecrypting) {
    decryptWithKey(secret);
  }

  const handlePasswordDecrypt = async () => {
    if (!secret || !password) return;

    setIsDecrypting(true);
    setDecryptError(null);

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
  if (status === "pending" || isDecrypting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-20"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {status === "pending" ? "Fetching secret..." : "Decrypting..."}
        </p>
      </motion.div>
    );
  }

  // Not found state
  if (status === "error") {
    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          {is404 ? (
            <Flame className="h-8 w-8 text-destructive" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-destructive" />
          )}
        </div>
        <div>
          <h2 className="mb-1 text-xl font-semibold">
            {is404 ? "Secret not found" : "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {is404
              ? "This secret has been burned, expired, or never existed."
              : "Failed to fetch the secret. Please try again."}
          </p>
        </div>
      </motion.div>
    );
  }

  // Decryption error state
  if (decryptError && !secret?.hasPassword) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="mb-1 text-xl font-semibold">Decryption failed</h2>
          <p className="text-sm text-muted-foreground">{decryptError}</p>
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
        className="space-y-6"
      >
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mb-1 text-lg font-semibold">
            This secret is password protected
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter the password to decrypt this secret.
          </p>

          {decryptError && (
            <p className="mb-4 text-sm text-destructive">{decryptError}</p>
          )}

          <div className="mx-auto max-w-sm space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordDecrypt()}
                placeholder="Enter password"
                className="w-full rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all",
                password
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "cursor-not-allowed bg-secondary text-muted-foreground"
              )}
            >
              <Lock className="h-4 w-4" />
              Decrypt
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Decrypted state
  if (!decrypted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">
              Secret decrypted successfully
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
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

        {decrypted.fileName && (
          <p className="mb-3 text-xs text-muted-foreground">
            File: {decrypted.fileName}
          </p>
        )}

        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <pre
            className={cn(
              "whitespace-pre-wrap break-all font-mono text-sm",
              showSecret ? "text-foreground" : "text-transparent select-none"
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

      <p className="text-center text-xs text-muted-foreground/60">
        This secret was decrypted client-side. The server never saw the
        plaintext.
      </p>
    </motion.div>
  );
}
