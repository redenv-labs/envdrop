import { SharePageView } from "@/app/share/view";
import { metatag } from "@/lib/metatag";

export async function generateMetadata() {
  return metatag({
    title: "Share a Secret | EnvDrop",
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
  return <SharePageView />;
}
