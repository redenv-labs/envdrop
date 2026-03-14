# EnvDrop Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the full backend for zero-knowledge secret sharing: Redis storage, API routes, client-side encryption, and the view/decrypt page.

**Architecture:** Upstash Redis stores encrypted blobs with TTL-based expiry. Two API routes handle create and retrieve. Client encrypts with @redenv/e2ee before sending. Decryption key lives in URL fragment (no password) or is derived from user password (with password).

**Tech Stack:** Next.js 16 Route Handlers, Upstash Redis, @upstash/ratelimit, @redenv/e2ee, nanoid

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/redis.ts` | Create | Upstash Redis client singleton |
| `src/lib/ratelimit.ts` | Create | Rate limiter configs for create/retrieve |
| `src/lib/secrets.ts` | Create | createSecret, getSecret, deleteSecret data layer |
| `src/app/api/secrets/route.ts` | Create | POST /api/secrets |
| `src/app/api/secrets/[id]/route.ts` | Create | GET /api/secrets/[id] |
| `src/components/share/share-form.tsx` | Modify | Wire real encryption + API call |
| `src/app/s/[id]/page.tsx` | Create | View/decrypt page (server component) |
| `src/components/view/view-secret.tsx` | Create | Client-side decryption UI |
| `.env.example` | Create | Document required env vars |

---

## Chunk 1: Infrastructure Layer

### Task 1: Create .env.example and Redis client

**Files:**
- Create: `.env.example`
- Create: `src/lib/redis.ts`

- [ ] **Step 1: Create .env.example**

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- [ ] **Step 2: Create Redis client singleton**

```typescript
// src/lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

- [ ] **Step 3: Commit**

```bash
git add .env.example src/lib/redis.ts
git commit -m "add Redis client and env example"
```

---

### Task 2: Create rate limiter config

**Files:**
- Create: `src/lib/ratelimit.ts`

- [ ] **Step 1: Create rate limiter**

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const createSecretLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:create",
});

export const getSecretLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:get",
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ratelimit.ts
git commit -m "add rate limiter config"
```

---

### Task 3: Create secrets data layer

**Files:**
- Create: `src/lib/secrets.ts`

- [ ] **Step 1: Create secrets module with types and CRUD**

```typescript
// src/lib/secrets.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/secrets.ts
git commit -m "add secrets data layer"
```

---

## Chunk 2: API Routes

### Task 4: Create POST /api/secrets route

**Files:**
- Create: `src/app/api/secrets/route.ts`

- [ ] **Step 1: Create the route handler**

```typescript
// src/app/api/secrets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSecret, type CreateSecretInput } from "@/lib/secrets";
import { createSecretLimiter } from "@/lib/ratelimit";

const MAX_PAYLOAD_SIZE = 200 * 1024; // 200KB
const VALID_EXPIRY = ["1h", "24h", "7d"] as const;
const VALID_TYPES = ["text", "file"] as const;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);

  const { success } = await createSecretLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  let body: CreateSecretInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!body.encryptedData || typeof body.encryptedData !== "string") {
    return NextResponse.json(
      { error: "missing_encrypted_data" },
      { status: 400 }
    );
  }

  if (body.encryptedData.length > MAX_PAYLOAD_SIZE) {
    return NextResponse.json(
      { error: "payload_too_large" },
      { status: 413 }
    );
  }

  if (!VALID_EXPIRY.includes(body.expiry as typeof VALID_EXPIRY[number])) {
    return NextResponse.json(
      { error: "invalid_expiry" },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(body.type as typeof VALID_TYPES[number])) {
    return NextResponse.json(
      { error: "invalid_type" },
      { status: 400 }
    );
  }

  // Validate password fields are paired
  const hasKey = !!body.encryptedKey;
  const hasSalt = !!body.salt;
  if (hasKey !== hasSalt) {
    return NextResponse.json(
      { error: "encryptedKey_and_salt_must_be_paired" },
      { status: 400 }
    );
  }

  const id = await createSecret({
    encryptedData: body.encryptedData,
    burnAfterRead: !!body.burnAfterRead,
    expiry: body.expiry,
    type: body.type,
    fileName: body.fileName,
    fileSize: body.fileSize,
    encryptedKey: body.encryptedKey,
    salt: body.salt,
  });

  return NextResponse.json({ id });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/secrets/route.ts
git commit -m "add POST /api/secrets route"
```

---

### Task 5: Create GET /api/secrets/[id] route

**Files:**
- Create: `src/app/api/secrets/[id]/route.ts`

- [ ] **Step 1: Create the route handler**

```typescript
// src/app/api/secrets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSecret } from "@/lib/secrets";
import { getSecretLimiter } from "@/lib/ratelimit";

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getIP(req);

  const { success } = await getSecretLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  const secret = await getSecret(id);

  if (!secret) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    encryptedData: secret.encryptedData,
    hasPassword: !!secret.encryptedKey,
    type: secret.type,
    expiresAt: secret.expiresAt,
    ...(secret.fileName && { fileName: secret.fileName }),
    ...(secret.fileSize && { fileSize: secret.fileSize }),
    ...(secret.encryptedKey && { encryptedKey: secret.encryptedKey }),
    ...(secret.salt && { salt: secret.salt }),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/secrets/\[id\]/route.ts
git commit -m "add GET /api/secrets/[id] route"
```

---

## Chunk 3: Wire Up Share Form Encryption

### Task 6: Update share-form.tsx with real encryption

**Files:**
- Modify: `src/components/share/share-form.tsx`

- [ ] **Step 1: Replace the stubbed handleEncrypt with real @redenv/e2ee encryption**

Replace the `handleEncrypt` function (lines 64-73) and add necessary imports. The flow:

1. Get plaintext data (text input or file contents read via FileReader)
2. `generateRandomKey()` to create master key
3. `encrypt(data, masterKey)` to encrypt
4. `exportKey(masterKey)` to get key hex for URL fragment
5. If password is set:
   - `generateSalt()` to create salt
   - `deriveKey(password, salt)` to derive password key
   - `encrypt(masterKeyHex, passwordKey)` to encrypt the master key
   - `bufferToHex(salt)` to convert salt to hex for storage
6. POST to `/api/secrets` with encrypted payload
7. Construct share link:
   - No password: `{origin}/s/{id}#{keyHex}`
   - With password: `{origin}/s/{id}` (no fragment)

Updated imports to add at top of file:
```typescript
import {
  generateRandomKey,
  exportKey,
  encrypt,
  generateSalt,
  deriveKey,
  bufferToHex,
} from "@redenv/e2ee";
import axios from "axios";
```

Updated `handleEncrypt`:
```typescript
const handleEncrypt = async () => {
  setIsEncrypting(true);

  try {
    // Get plaintext content
    let plaintext: string;
    if (mode === "file" && file) {
      plaintext = await file.text();
    } else {
      plaintext = secret;
    }

    // Generate random master key and encrypt
    const masterKey = await generateRandomKey();
    const encryptedData = await encrypt(plaintext, masterKey);
    const keyHex = await exportKey(masterKey);

    // Build request payload
    const payload: Record<string, unknown> = {
      encryptedData,
      burnAfterRead,
      expiry,
      type: mode,
      ...(mode === "file" && file && {
        fileName: file.name,
        fileSize: file.size,
      }),
    };

    // If password protection is enabled, encrypt the master key
    if (usePassword && password) {
      const salt = generateSalt();
      const passwordKey = await deriveKey(password, salt);
      const encryptedKey = await encrypt(keyHex, passwordKey);
      payload.encryptedKey = encryptedKey;
      payload.salt = bufferToHex(salt);
    }

    // Send to API
    const { data } = await axios.post("/api/secrets", payload);

    // Build share link
    const origin = window.location.origin;
    if (usePassword && password) {
      setShareLink(`${origin}/s/${data.id}`);
    } else {
      setShareLink(`${origin}/s/${data.id}#${keyHex}`);
    }
  } catch (err) {
    console.error("Encryption failed:", err);
  } finally {
    setIsEncrypting(false);
  }
};
```

- [ ] **Step 2: Verify build compiles**

Run: `bunx next build` (or check for TypeScript errors with `bunx tsc --noEmit`)

- [ ] **Step 3: Commit**

```bash
git add src/components/share/share-form.tsx
git commit -m "wire up real encryption in share form"
```

---

## Chunk 4: View/Decrypt Page

### Task 7: Create the view secret page (server component shell)

**Files:**
- Create: `src/app/s/[id]/page.tsx`

- [ ] **Step 1: Create the server component page**

```typescript
// src/app/s/[id]/page.tsx
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ViewSecret } from "@/components/view/view-secret";

export const metadata: Metadata = {
  title: "View Secret - EnvDrop",
  description: "Decrypt and view a shared secret.",
};

export default async function ViewSecretPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <ViewSecret id={id} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/s/\[id\]/page.tsx
git commit -m "add view secret page shell"
```

---

### Task 8: Create the ViewSecret client component

**Files:**
- Create: `src/components/view/view-secret.tsx`

- [ ] **Step 1: Create the decryption UI component**

This component handles:
1. Fetching the encrypted secret from the API
2. If no password: extracting key from URL hash, decrypting automatically
3. If password-protected: showing password input, deriving key, decrypting
4. Displaying the decrypted secret
5. Showing "not found" state for burned/expired/missing secrets

```typescript
// src/components/view/view-secret.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  importKey,
  decrypt,
  deriveKey,
  hexToBuffer,
} from "@redenv/e2ee";
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

type ViewState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "needs_password"; secret: SecretResponse }
  | { status: "decrypting" }
  | { status: "decrypted"; plaintext: string; type: "text" | "file"; fileName?: string }
  | { status: "error"; message: string };

export function ViewSecret({ id }: { id: string }) {
  const [state, setState] = useState<ViewState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const fetchAndDecrypt = useCallback(async () => {
    try {
      const { data: secret } = await axios.get<SecretResponse>(
        `/api/secrets/${id}`
      );

      if (secret.hasPassword) {
        setState({ status: "needs_password", secret });
        return;
      }

      // Extract key from URL hash
      const keyHex = window.location.hash.slice(1);
      if (!keyHex) {
        setState({ status: "error", message: "Missing decryption key in URL" });
        return;
      }

      setState({ status: "decrypting" });
      const key = await importKey(keyHex);
      const plaintext = await decrypt(secret.encryptedData, key);

      setState({
        status: "decrypted",
        plaintext,
        type: secret.type,
        fileName: secret.fileName,
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setState({ status: "not_found" });
      } else {
        setState({
          status: "error",
          message: "Failed to decrypt. The link may be invalid.",
        });
      }
    }
  }, [id]);

  useEffect(() => {
    fetchAndDecrypt();
  }, [fetchAndDecrypt]);

  const handlePasswordDecrypt = async () => {
    if (state.status !== "needs_password" || !password) return;

    const secret = state.secret;
    setState({ status: "decrypting" });

    try {
      const salt = hexToBuffer(secret.salt!);
      const passwordKey = await deriveKey(password, salt);
      const masterKeyHex = await decrypt(secret.encryptedKey!, passwordKey);
      const masterKey = await importKey(masterKeyHex);
      const plaintext = await decrypt(secret.encryptedData, masterKey);

      setState({
        status: "decrypted",
        plaintext,
        type: secret.type,
        fileName: secret.fileName,
      });
    } catch {
      setState({ status: "needs_password", secret });
      setPassword("");
    }
  };

  const handleCopy = async () => {
    if (state.status !== "decrypted") return;
    await navigator.clipboard.writeText(state.plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (state.status === "loading" || state.status === "decrypting") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-20"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {state.status === "loading"
            ? "Fetching secret..."
            : "Decrypting..."}
        </p>
      </motion.div>
    );
  }

  // Not found state
  if (state.status === "not_found") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <Flame className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="mb-1 text-xl font-semibold">Secret not found</h2>
          <p className="text-sm text-muted-foreground">
            This secret has been burned, expired, or never existed.
          </p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (state.status === "error") {
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
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </div>
      </motion.div>
    );
  }

  // Password prompt state
  if (state.status === "needs_password") {
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

        {state.fileName && (
          <p className="mb-3 text-xs text-muted-foreground">
            File: {state.fileName}
          </p>
        )}

        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <pre
            className={cn(
              "whitespace-pre-wrap break-all font-mono text-sm",
              showSecret ? "text-foreground" : "text-transparent select-none"
            )}
            style={!showSecret ? { textShadow: "0 0 8px var(--foreground)" } : undefined}
          >
            {state.plaintext}
          </pre>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/60">
        This secret was decrypted client-side. The server never saw the plaintext.
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `bunx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/view/view-secret.tsx
git commit -m "add view secret decryption component"
```

---

## Chunk 5: Integration Verification

### Task 9: End-to-end verification

- [ ] **Step 1: Ensure .env.local exists with Upstash credentials**

Ask user for their Upstash Redis REST URL and token. They need to create a free database at console.upstash.com if they haven't already.

- [ ] **Step 2: Run dev server and test manually**

Test flow:
1. Go to `/share`, paste a secret, click "Encrypt & Generate Link"
2. Copy the generated link
3. Open in new tab, verify secret decrypts
4. Test burn after read: create another secret, view it, try the link again (should show "not found")
5. Test password protection: create with password, open link, enter password, verify decrypt

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "complete backend integration for secret sharing"
```
