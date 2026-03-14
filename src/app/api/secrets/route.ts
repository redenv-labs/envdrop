import { NextRequest, NextResponse } from "next/server";
import { createSecret, type CreateSecretInput } from "@/lib/secrets";
import { createSecretLimiter } from "@/lib/ratelimit";

const MAX_PAYLOAD_SIZE = 200 * 1024;
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
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: CreateSecretInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.encryptedData || typeof body.encryptedData !== "string") {
    return NextResponse.json(
      { error: "missing_encrypted_data" },
      { status: 400 }
    );
  }

  if (body.encryptedData.length > MAX_PAYLOAD_SIZE) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  if (
    !VALID_EXPIRY.includes(body.expiry as (typeof VALID_EXPIRY)[number])
  ) {
    return NextResponse.json({ error: "invalid_expiry" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(body.type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

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
