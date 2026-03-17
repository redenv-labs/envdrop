import { ViewSecretPage } from "@/components/view/view-secret-page";
import { metatag } from "@/lib/metatag";

export async function generateMetadata() {
  return metatag({
    title: "View Secret | EnvDrop",
    description:
      "Decrypt and view a shared secret. Zero-knowledge decryption happens entirely in your browser.",
    keywords: [
      "view secret",
      "decrypt",
      "zero-knowledge",
      "client-side decryption",
    ],
    robots: "noindex, nofollow",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ViewSecretPage id={id} />;
}
