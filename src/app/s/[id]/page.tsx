import type { Metadata } from "next";
import { ViewSecretPage } from "@/components/view/view-secret-page";

export const metadata: Metadata = {
  title: "View Secret - EnvDrop",
  description: "Decrypt and view a shared secret.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ViewSecretPage id={id} />;
}
