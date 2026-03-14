import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ShareForm } from "@/components/share/share-form";

export const metadata: Metadata = {
  title: "Share a Secret - EnvDrop",
  description:
    "Paste a secret or drop a .env file. Encrypted in your browser. The server never sees it.",
};

export default function SharePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Share a secret
          </h1>
          <p className="text-muted-foreground">
            Everything is encrypted in your browser before it leaves your
            machine.
          </p>
        </div>
        <ShareForm />
      </div>
    </main>
  );
}
