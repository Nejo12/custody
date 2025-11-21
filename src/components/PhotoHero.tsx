"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";

interface FloatingItem {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  orbitRadius: number;
}

interface PreviewCard {
  title: string;
  lines: string[];
  accent: "amber" | "teal";
}

const floatingItems: FloatingItem[] = [
  { id: "1", content: "§", x: 12, y: 18, size: 42, duration: 12, delay: 0, orbitRadius: 18 },
  { id: "2", content: "BGB", x: 82, y: 12, size: 28, duration: 13, delay: 1, orbitRadius: 16 },
  { id: "3", content: "Art.", x: 86, y: 70, size: 24, duration: 14, delay: 1.4, orbitRadius: 14 },
  { id: "4", content: "¶", x: 18, y: 74, size: 34, duration: 16, delay: 0.6, orbitRadius: 18 },
  { id: "5", content: "1626a", x: 8, y: 48, size: 22, duration: 11, delay: 1.8, orbitRadius: 14 },
];

function FloatingLegalItem({ item, reduceMotion }: { item: FloatingItem; reduceMotion: boolean }) {
  if (reduceMotion) {
    return (
      <div
        className="absolute font-bold text-white/30 dark:text-white/20 select-none pointer-events-none"
        style={{
          left: `${item.x}%`,
          top: `${item.y}%`,
          fontSize: `${item.size}px`,
        }}
      >
        {item.content}
      </div>
    );
  }

  return (
    <motion.div
      className="absolute font-bold text-white/30 dark:text-white/20 select-none pointer-events-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        fontSize: `${item.size}px`,
      }}
      animate={{
        x: [0, item.orbitRadius, 0, -item.orbitRadius, 0],
        y: [0, -item.orbitRadius, 0, item.orbitRadius, 0],
        rotate: [0, 360],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {item.content}
    </motion.div>
  );
}

export default function PhotoHero({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const { t } = useI18n();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const shouldReduceMotion = reduceMotion || prefersReducedMotion;

  const previewCards: PreviewCard[] = [
    {
      title: t.home?.heroPreview?.packTitle || "Court-ready PDF pack",
      lines: [
        t.home?.heroPreview?.packLineOne || "Cover letter with § references",
        t.home?.heroPreview?.packLineTwo || "Attachments checklist",
        t.home?.heroPreview?.packLineThree || "Signature-ready download",
      ],
      accent: "amber",
    },
    {
      title: t.home?.heroPreview?.timelineTitle || "Action timeline",
      lines: [
        t.home?.heroPreview?.timelineLineOne || "Book Jugendamt visit",
        t.home?.heroPreview?.timelineLineTwo || "Print + sign cover letter",
        t.home?.heroPreview?.timelineLineThree || "Calendar reminders included",
      ],
      accent: "teal",
    },
  ];

  const cardAnimation = shouldReduceMotion
    ? {}
    : {
        animate: { y: [0, -10, 0] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-500 dark:from-amber-600 dark:via-amber-700 dark:to-emerald-700"
        {...(shouldReduceMotion
          ? {}
          : {
              animate: {
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              },
              transition: {
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              },
            })}
        style={{
          backgroundSize: "350% 350%",
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 48%), radial-gradient(circle at 70% 50%, rgba(0,0,0,0.15) 0%, transparent 50%)",
        }}
        {...(shouldReduceMotion
          ? {}
          : {
              animate: {
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360],
              },
              transition: {
                duration: 24,
                repeat: Infinity,
                ease: "linear",
              },
            })}
      />

      <div className="absolute inset-0">
        {floatingItems.map((item) => (
          <FloatingLegalItem key={item.id} item={item} reduceMotion={shouldReduceMotion} />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-lg"
        {...(shouldReduceMotion
          ? {}
          : {
              animate: { y: [0, -12, 0], scale: [1, 1.02, 1] },
              transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
            })}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative rounded-3xl bg-white/90 dark:bg-zinc-900/80 border border-white/70 dark:border-zinc-800 shadow-2xl backdrop-blur">
          <div className="absolute -top-5 -left-5 h-24 w-24 bg-gradient-to-br from-amber-300 to-emerald-300 dark:from-amber-500/50 dark:to-emerald-500/50 blur-3xl opacity-60" />
          <div className="absolute -bottom-6 -right-6 h-28 w-28 bg-gradient-to-br from-emerald-300 to-sky-300 dark:from-emerald-500/50 dark:to-sky-500/40 blur-3xl opacity-50" />

          <div className="relative p-5 sm:p-7 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <span className="text-lg font-semibold text-amber-700 dark:text-amber-200">§</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  {t.home?.heroPreview?.header || "Outcome preview"}
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-200 mt-1">
                  {t.home?.heroPreview?.lead ||
                    "The interview builds these artifacts as you answer. No stock screenshots—real, ready-to-use pieces."}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {previewCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm"
                  {...cardAnimation}
                  style={{ transformOrigin: index % 2 === 0 ? "left center" : "right center" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        card.accent === "amber" ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {card.title}
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {card.lines.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
                {t.home?.heroPreview?.timeline || "Timeline & reminders"}
              </div>
              <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                {t.home?.heroPreview?.timelineCopy ||
                  "Key dates, deadlines, and a simple sequence you can follow without a lawyer."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
