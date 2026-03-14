import { NextRequest, NextResponse } from "next/server";
import { getSecret, deleteSecret, burnSecret } from "@/lib/secrets";
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
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const secret = await getSecret(id);

  if (!secret) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    encryptedData: secret.encryptedData,
    hasPassword: !!secret.encryptedKey,
    burnAfterRead: secret.burnAfterRead,
    type: secret.type,
    expiresAt: secret.expiresAt,
    ...(secret.fileName && { fileName: secret.fileName }),
    ...(secret.fileSize && { fileSize: secret.fileSize }),
    ...(secret.encryptedKey && { encryptedKey: secret.encryptedKey }),
    ...(secret.salt && { salt: secret.salt }),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getIP(req);

  const { success } = await getSecretLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const burned = await burnSecret(id);
  if (!burned) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = getIP(req);

  const { success } = await getSecretLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  await deleteSecret(id);
  return NextResponse.json({ success: true });
}
