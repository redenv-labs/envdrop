import { redis } from "./redis";
import { nanoid } from "nanoid";

const EXPIRY_MAP = {
  "1h": 3600,
  "24h": 86400,
  "7d": 604800,
} as const;

export type ExpiryOption = keyof typeof EXPIRY_MAP;

export interface CreateSecretInput {
  encryptedData: string;
  burnAfterRead: boolean;
  expiry: ExpiryOption;
  type: "text" | "file";
  fileName?: string;
  fileSize?: number;
  encryptedKey?: string;
  salt?: string;
}

export interface StoredSecret {
  encryptedData: string;
  burnAfterRead: boolean;
  type: "text" | "file";
  fileName?: string;
  fileSize?: number;
  createdAt: number;
  expiresAt: number;
  encryptedKey?: string;
  salt?: string;
}

export async function createSecret(input: CreateSecretInput): Promise<string> {
  const id = nanoid();
  const ttl = EXPIRY_MAP[input.expiry];
  const now = Date.now();

  const secret: StoredSecret = {
    encryptedData: input.encryptedData,
    burnAfterRead: input.burnAfterRead,
    type: input.type,
    createdAt: now,
    expiresAt: now + ttl * 1000,
    ...(input.fileName && { fileName: input.fileName }),
    ...(input.fileSize && { fileSize: input.fileSize }),
    ...(input.encryptedKey && { encryptedKey: input.encryptedKey }),
    ...(input.salt && { salt: input.salt }),
  };

  await redis.set(`secret:${id}`, JSON.stringify(secret), { ex: ttl });
  return id;
}

export async function getSecret(id: string): Promise<StoredSecret | null> {
  const raw = await redis.get<string>(`secret:${id}`);
  if (!raw) return null;

  const secret: StoredSecret = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (secret.burnAfterRead) {
    await redis.del(`secret:${id}`);
  }

  return secret;
}

export async function deleteSecret(id: string): Promise<void> {
  await redis.del(`secret:${id}`);
}
