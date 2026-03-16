"use client";

import { useEffect } from "react";
import { Lock, ArrowRight } from "lucide-react";
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
import { useShareFormStore } from "@/stores/share-form-store";

import { SecretInput } from "./secret-input";
import { ShareOptions } from "./share-options";
import { SuccessView } from "./success-view";
import { ErrorBanner } from "./error-banner";
import { Spinner } from "@heroui/spinner";

const MAX_SIZE_KB = 200;

const ERROR_MESSAGES: Record<string, string> = {
  payload_too_large: "Your secret is too large. The maximum size is 200 KB.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  invalid_expiry: "Invalid expiry option selected.",
  invalid_type: "Invalid secret type.",
  missing_encrypted_data: "No data to encrypt. Please enter a secret.",
};

function getMutationError(error: unknown): string {
  if (!axios.isAxiosError(error))
    return "Something went wrong. Please try again.";
  const code = error.response?.data?.error;
  return ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.";
}

interface EncryptInput {
  plaintext: string;
  burnAfterRead: boolean;
  expiry: "1h" | "24h" | "3d";
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
    payload.salt = bufferToHex(salt.buffer as ArrayBuffer);
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

export function ShareForm({
  droppedFile,
  onDroppedFileConsumed,
}: ShareFormProps) {
  const store = useShareFormStore();

  const mutation = useMutation({
    mutationFn: encryptAndStore,
    onSuccess: (link) => store.setShareLink(link),
  });

  useEffect(() => {
    if (droppedFile) {
      store.setFile(droppedFile);
      store.setMode("file");
      onDroppedFileConsumed?.();
    }
  }, [droppedFile, onDroppedFileConsumed, store]);

  // Size validation
  const hasContent =
    store.mode === "text"
      ? store.secret.trim().length > 0
      : store.file !== null;

  const textSizeKB =
    store.mode === "text"
      ? new TextEncoder().encode(store.secret).length / 1024
      : 0;
  const isTextTooLarge = store.mode === "text" && textSizeKB > MAX_SIZE_KB;
  const fileTooLarge =
    store.mode === "file" &&
    !!store.file &&
    store.file.size > MAX_SIZE_KB * 1024;
  const isTooLarge = isTextTooLarge || fileTooLarge;

  const sizeErrorMessage = isTooLarge
    ? `Your content is ${isTextTooLarge ? textSizeKB.toFixed(0) : ((store.file?.size ?? 0) / 1024).toFixed(0)} KB. The maximum size is ${MAX_SIZE_KB} KB.`
    : null;

  const apiErrorMessage = mutation.isError
    ? getMutationError(mutation.error)
    : null;

  const handleEncrypt = async () => {
    let plaintext: string;
    if (store.mode === "file" && store.file) {
      plaintext = await store.file.text();
    } else {
      plaintext = store.secret;
    }

    mutation.mutate({
      plaintext,
      burnAfterRead: store.burnAfterRead,
      expiry: store.expiry,
      type: store.mode,
      ...(store.mode === "file" &&
        store.file && {
          fileName: store.file.name,
          fileSize: store.file.size,
        }),
      ...(store.usePassword && store.password && { password: store.password }),
    });
  };

  const handleReset = () => {
    store.reset();
    mutation.reset();
  };

  if (store.shareLink) {
    return <SuccessView onReset={handleReset} />;
  }

  return (
    <div className="space-y-5">
      <SecretInput />
      <ShareOptions />

      <ErrorBanner message={sizeErrorMessage ?? apiErrorMessage} />

      {/* Encrypt button */}
      <button
        onClick={handleEncrypt}
        disabled={!hasContent || mutation.isPending || isTooLarge}
        className={cn(
          "group flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-medium transition-all",
          hasContent && !isTooLarge
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
            : "cursor-not-allowed bg-secondary text-muted-foreground",
        )}
      >
        {mutation.isPending ? (
          <>
            <Spinner size="sm" />
            Encrypting...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Encrypt & Generate Link
            {hasContent && !isTooLarge && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </>
        )}
      </button>
    </div>
  );
}
