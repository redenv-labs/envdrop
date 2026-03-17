import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Features } from "@/components/home/features";
import { Roadmap } from "@/components/home/roadmap";
import { Footer } from "@/components/footer";
import { metatag } from "@/lib/metatag";

export async function generateMetadata() {
  return metatag({
    title: "EnvDrop | Zero-Knowledge Secret Sharing",
    description:
      "Share secrets, API keys, and .env files securely. End-to-end encrypted in your browser. The server never sees the plaintext.",
    keywords: [
      "secret sharing",
      "zero-knowledge",
      "encryption",
      "env file",
      "api keys",
      "aes-256-gcm",
      "secure sharing",
    ],
  });
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Roadmap />
      <Footer />
    </main>
  );
}
