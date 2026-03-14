import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Features } from "@/components/features";
import { Roadmap } from "@/components/roadmap";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Roadmap />
    </main>
  );
}
