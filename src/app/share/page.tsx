import { SharePageContent } from "@/components/share/share-page-content";
import { metatag } from "@/lib/metatag";
import { getOrigin } from "@/lib/url";

export async function generateMetadata() {
  const origin = await getOrigin();
  return metatag({
    title: "Share a Secret | EnvDrop",
    url: `${origin}/share`,
    description:
      "Paste a secret or drop a .env file. Encrypted in your browser with AES-256-GCM. The server never sees it.",
    keywords: [
      "share secret",
      "encrypt",
      "env file upload",
      "zero-knowledge",
      "client-side encryption",
    ],
  });
}

export default function SharePage() {
  return <SharePageContent />;
}
