import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ViewSecret } from "@/components/view/view-secret";

export const metadata: Metadata = {
  title: "View Secret - EnvDrop",
  description: "Decrypt and view a shared secret.",
};

export default async function ViewSecretPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <ViewSecret id={id} />
      </div>
    </main>
  );
}
