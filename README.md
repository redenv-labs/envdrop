<p align="center">
  <img src="public/envdrop.svg" alt="EnvDrop" width="80" />
</p>

<h1 align="center">EnvDrop</h1>

<p align="center">
  Zero-knowledge encrypted secret sharing for developers.
  <br />
  Paste a secret or drop a <code>.env</code> file - everything encrypts in your browser.
  <br />
  The server never sees it.
</p>

<p align="center">
  <a href="https://envdrop.dev">Website</a> &middot;
  <a href="https://github.com/redenv-labs/envdrop/issues">Issues</a> &middot;
  <a href="https://github.com/redenv-labs/envdrop">GitHub</a>
</p>

---

## How It Works

```
You                          EnvDrop Server                    Recipient
 │                               │                               │
 ├─ Encrypt in browser ──────►   │                               │
 │  (AES-256-GCM)                │                               │
 │                               ├─ Store encrypted blob         │
 │                               │  (zero knowledge)             │
 ├─ Get share link ◄─────────    │                               │
 │  (key lives in URL fragment)  │                               │
 │                               │                               │
 ├─ Send link to recipient ──────────────────────────────────►   │
 │                               │                               │
 │                               │    ◄── Fetch encrypted blob ──┤
 │                               │                               │
 │                               │        Decrypt in browser ────┤
 │                               │        (AES-256-GCM)          │
```

1. Your browser generates a random AES-256-GCM key and encrypts the secret client-side
2. Only the encrypted blob is sent to the server - the key stays in the URL fragment (`#key`), which is never sent over HTTP
3. The recipient opens the link, their browser fetches the blob and decrypts it locally
4. If burn-after-read is enabled, the secret is destroyed after successful decryption

## Features

- **Zero-knowledge encryption** - AES-256-GCM, client-side only. The server stores encrypted blobs it cannot read.
- **Burn after read** - Secret self-destructs after one successful decryption.
- **Password protection** - Optional second layer using PBKDF2 key derivation.
- **File support** - Drop a `.env` file or any file up to 200KB.
- **Auto-expiry** - Choose 1 hour, 24 hours, or 3 days. Secrets are purged from Redis after TTL.
- **Rate limiting** - Per-IP sliding window to prevent abuse.
- **No sign-up** - No accounts, no tracking, no cookies.
- **Open source** - MIT licensed. Audit the crypto yourself.

## Security Model

- Encryption and decryption happen **exclusively in the browser** using the Web Crypto API
- The encryption key is placed in the **URL fragment** (`#`), which browsers never send to the server
- The server only stores the encrypted ciphertext - it cannot decrypt anything
- Password-protected secrets use **PBKDF2** to derive a wrapping key that encrypts the master key
- Burn-after-read deletion is triggered **client-side after successful decryption**, preventing premature deletion on page reload
- All API endpoints are **rate-limited** per IP using Upstash Ratelimit

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE) - built by [Redenv Labs](https://github.com/redenv-labs)
