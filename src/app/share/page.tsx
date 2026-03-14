import type { Metadata } from "next";
import { SharePageContent } from "@/components/share/share-page-content";

export const metadata: Metadata = {
  title: "Share a Secret - EnvDrop",
  description:
    "Paste a secret or drop a .env file. Encrypted in your browser. The server never sees it.",
};

export default function SharePage() {
  return <SharePageContent />;
}
