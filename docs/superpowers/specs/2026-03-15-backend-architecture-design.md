# EnvDrop Backend Architecture Design

## Overview

Backend system for EnvDrop zero-knowledge secret sharing. Uses Upstash Redis as the sole data store for MVP. Secrets are ephemeral (burn after read, max 7d TTL). Designed so future workspace features layer on via Supabase Postgres without breaking existing anonymous secrets.

## Data Store

**Upstash Redis** (serverless, pay-per-request, built-in TTL).

```
Key:    secret:{nanoid}
TTL:    3600 (1h) | 86400 (24h) | 604800 (7d)
Value:  JSON string
```

```typescript
{
  encryptedData: string        // iv.ciphertext blob from @redenv/e2ee
  burnAfterRead: boolean
  type: "text" | "file"
  fileName?: string
  fileSize?: number
  createdAt: number            // unix ms
  expiresAt: number            // unix ms (for display)
  encryptedKey?: string        // master key encrypted with password-derived key
  salt?: string                // hex salt for PBKDF2
}
```

`hasPassword` derived from `!!encryptedKey`. No view counters needed for MVP.

## Encryption Flows

Uses `@redenv/e2ee` (AES-256-GCM, PBKDF2 310K iterations).

### No Password

1. `generateRandomKey()` -> masterKey
2. `encrypt(data, masterKey)` -> encryptedBlob
3. `exportKey(masterKey)` -> keyHex
4. POST encrypted blob to server, get back `{ id }`
5. Link: `envdrop.dev/s/{id}#{keyHex}` (key in URL fragment, never sent to server)

### With Password

1. `generateRandomKey()` -> masterKey
2. `encrypt(data, masterKey)` -> encryptedBlob
3. `exportKey(masterKey)` -> masterKeyHex
4. `generateSalt()` -> salt
5. `deriveKey(password, salt)` -> passwordKey
6. `encrypt(masterKeyHex, passwordKey)` -> encryptedMasterKey
7. POST encrypted blob + encryptedKey + salt to server
8. Link: `envdrop.dev/s/{id}` (no fragment, password needed)

### Recipient Decrypt

**No password:** Extract keyHex from `#fragment` -> `importKey` -> `decrypt`

**With password:** Enter password -> `deriveKey(password, salt)` -> `decrypt(encryptedKey)` -> `importKey` -> `decrypt(encryptedData)`

## API Routes

### POST /api/secrets

```typescript
// Request
{
  encryptedData: string          // max 200KB
  burnAfterRead: boolean
  expiry: "1h" | "24h" | "7d"
  type: "text" | "file"
  fileName?: string
  fileSize?: number
  encryptedKey?: string          // present if password-protected
  salt?: string                  // present if password-protected
}

// Response
{ id: string }
```

### GET /api/secrets/[id]

```typescript
// Response (found)
{
  encryptedData: string
  hasPassword: boolean
  type: "text" | "file"
  fileName?: string
  fileSize?: number
  expiresAt: number
  encryptedKey?: string
  salt?: string
}

// Response (gone)
{ error: "not_found" }
```

If `burnAfterRead`, delete key from Redis immediately after read. Same error response for never-existed, burned, and expired secrets.

## Rate Limiting

`@upstash/ratelimit` with sliding window, same Redis instance.

- POST /api/secrets: 10 req/min per IP
- GET /api/secrets/[id]: 30 req/min per IP

IP from `x-forwarded-for`, fallback `x-real-ip`.

## Security

- URL fragment never sent to server (zero-knowledge)
- nanoid 21 chars (64^21 possible IDs, brute force infeasible)
- Same `not_found` error for all missing states (no info leaking)
- 200KB payload cap
- No CAPTCHA/blocklist for MVP

## Project Structure

```
src/
  lib/
    redis.ts          # Upstash Redis client singleton
    ratelimit.ts      # Rate limiter config
    secrets.ts        # createSecret, getSecret, deleteSecret
  app/
    api/
      secrets/
        route.ts      # POST /api/secrets
        [id]/
          route.ts    # GET /api/secrets/[id]
    s/
      [id]/
        page.tsx      # View/decrypt page
  components/
    share/
      share-form.tsx  # Wire up real encryption
    view/
      view-secret.tsx # Decryption UI
```

## Dependencies

- `@upstash/redis`
- `@upstash/ratelimit`
- `nanoid`

## Environment Variables

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Workspace Migration Path

When workspaces arrive, add Supabase Postgres for users/workspaces. Add optional `workspaceId` field to Redis secret schema. Old anonymous secrets (no workspaceId) continue working unchanged. Postgres stores workspace membership and references Redis secret IDs.
