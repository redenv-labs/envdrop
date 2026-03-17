"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_GITHUB_URL } from "@/config";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "flex h-16 w-full max-w-3xl items-center justify-between rounded-2xl border px-5 transition-all duration-300",
          scrolled
            ? "border-border/50 bg-background/70 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "border-border/30 bg-background/50 backdrop-blur-md",
        )}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/envdrop.png" alt="Logo" width={100} height={100} className="w-8 h-8" priority />
          <span className="text-sm font-semibold tracking-tight">EnvDrop</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <a
            href={APP_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>

          <Link
            href="/share"
            className={cn(
              "group flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
              pathname === "/share"
                ? "bg-primary/10 text-primary"
                : "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25",
            )}
          >
            Share a Secret
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}
