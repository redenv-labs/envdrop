"use client";

import { useEffect, useRef } from "react";
import { Check, Rocket, Terminal, Users, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const phases = [
  {
    icon: Rocket,
    title: "Secret sharing",
    items: [
      "Paste & encrypt secrets",
      ".env file drop",
      "Burn after read",
      "Configurable expiry",
      "Password-protected secrets",
    ],
  },
  {
    icon: Users,
    title: "Workspaces & teams",
    items: [
      "User accounts & auth",
      "Team workspaces",
      "Role-based access",
      "Dashboard & history",
    ],
  },
  {
    icon: Terminal,
    title: "CLI & sync",
    items: [
      "CLI push & pull .env files",
      "Live sync on change",
      "Audit logs",
      "Custom expiry settings",
    ],
  },
  {
    icon: Bot,
    title: "Integrations",
    items: [
      "Slack & Discord bot",
      "REST API for CI/CD",
      "SSO (SAML/OIDC)",
    ],
  },
];

// First phase is always live, second is next, rest are soon
function getStatus(index: number) {
  if (index === 0) return "live";
  if (index === 1) return "next";
  return "soon";
}

function getStatusLabel(index: number) {
  if (index === 0) return "Live now";
  return null;
}

export function Roadmap() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Timeline progress line
      if (progressRef.current && timelineRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 60%",
              end: "bottom 40%",
              scrub: 0.8,
            },
          },
        );
      }

      // Cards stagger in
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const isLeft = i % 2 === 0;

        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isLeft ? -60 : 60,
            y: 20,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );

        // Animate items inside card
        const items = card.querySelectorAll("[data-roadmap-item]");
        gsap.fromTo(
          items,
          { opacity: 0, x: isLeft ? -20 : 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // Dots pop in
      dotsRef.current.forEach((dot) => {
        if (!dot) return;
        gsap.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: dot,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="roadmap"
      ref={sectionRef}
      className="relative scroll-mt-20 px-6 py-24"
    >
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div ref={headingRef} className="mb-20 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What&apos;s coming
          </h2>
          <p className="text-muted-foreground">
            We&apos;re building in the open. Here&apos;s where we&apos;re
            headed.
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Static track */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border/30 md:left-1/2 md:-translate-x-px" />

          {/* Animated progress */}
          <div
            ref={progressRef}
            className="absolute left-6 top-0 bottom-0 w-px origin-top bg-primary/50 md:left-1/2 md:-translate-x-px"
          />

          <div className="space-y-16 md:space-y-24">
            {phases.map((phase, i) => {
              const status = getStatus(i);
              const label = getStatusLabel(i);
              const isLive = status === "live";
              const Icon = isLive ? Check : phase.icon;

              return (
                <div
                  key={phase.title}
                  className={cn(
                    "relative flex flex-col gap-6 md:flex-row md:items-start md:gap-16",
                    i % 2 !== 0 && "md:flex-row-reverse",
                  )}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-0 z-10 -translate-x-1/2 md:left-1/2">
                    <div
                      ref={(el) => {
                        dotsRef.current[i] = el;
                      }}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
                        isLive
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "border-border/50 bg-card text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    ref={(el) => {
                      cardsRef.current[i] = el;
                    }}
                    className={cn(
                      "ml-16 flex-1 md:ml-0",
                      i % 2 === 0 ? "md:pr-20 md:text-right" : "md:pl-20",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl border p-6 backdrop-blur-sm transition-colors",
                        isLive
                          ? "border-primary/20 bg-primary/5"
                          : "border-border/30 bg-card/30",
                      )}
                    >
                      {/* Status badge — only for live */}
                      {label && (
                        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-mono text-xs font-medium text-primary">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                          {label}
                        </span>
                      )}

                      <h3
                        className={cn(
                          "mb-4 text-xl font-semibold",
                          !label && "mt-0",
                        )}
                      >
                        {phase.title}
                      </h3>

                      <ul
                        className={cn(
                          "space-y-2.5",
                          i % 2 === 0 && "md:ml-auto",
                        )}
                      >
                        {phase.items.map((item) => (
                          <li
                            key={item}
                            data-roadmap-item
                            className={cn(
                              "flex items-center gap-2.5 text-sm",
                              isLive
                                ? "text-foreground/80"
                                : "text-muted-foreground",
                              i % 2 === 0 && "md:justify-end",
                            )}
                          >
                            {i % 2 === 0 && (
                              <span className="hidden md:inline">{item}</span>
                            )}
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                isLive
                                  ? "bg-primary/50"
                                  : "bg-muted-foreground/30",
                              )}
                            />
                            {i % 2 === 0 ? (
                              <span className="md:hidden">{item}</span>
                            ) : (
                              <span>{item}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden flex-1 md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
