import { ViewSecretPage } from "@/components/view/view-secret-page";
import { metatag } from "@/lib/metatag";
import { getOrigin } from "@/lib/url";

export async function generateMetadata() {
  const origin = await getOrigin();
  return metatag({
    title: "View Secret | EnvDrop",
    url: `${origin}/s`,
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
