"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import FadeIn from "@/components/FadeIn";
import NewsletterSignup from "@/components/NewsletterSignup";
import HowItWorks from "@/components/HowItWorks";
import FeatureGrid from "@/components/FeatureGrid";
import TrustIndicators from "@/components/TrustIndicators";
import AnimatedHero from "@/components/AnimatedHero";
import blogData from "@/data/blog.json";

/**
 * Type definition for blog post structure
 */
type BlogPost = {
  slug: string;
  title: string;
  readTime: string;
  published: string;
};

type OutcomeItem = {
  tag: string;
  title: string;
  description: string;
  accent: "amber" | "teal";
};

type ProofItem = {
  title: string;
  description: string;
};

/**
 * HomeClient Component
 * Main landing page component with enhanced hero, how it works, features, and CTAs
 */
export default function HomeClient() {
  const { t } = useI18n();
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Get 2 most recent blog posts sorted by published date (descending)
  const recentPosts = useMemo(
    () =>
      (blogData.posts as BlogPost[])
        .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
        .slice(0, 2),
    []
  );

  const heroBadges = [
    t.home?.heroCitationsBadge || "BGB citations on every recommendation",
    t.home?.heroPrivacyBadge || "Privacy-first · No signup",
    t.home?.heroSpeedBadge || "6-minute guided interview",
  ];

  const outcomeItems: OutcomeItem[] = [
    {
      tag: t.home?.outcome?.documentsTag || "Court-ready PDF",
      title: t.home?.outcome?.documentsTitle || "Personalized filings with the right § references",
      description:
        t.home?.outcome?.documentsDescription ||
        "Download a clean PDF pack with cover letter, attachments checklist, and the citations you need.",
      accent: "amber",
    },
    {
      tag: t.home?.outcome?.checklistTag || "Checklist",
      title: t.home?.outcome?.checklistTitle || "Step-by-step actions that fit your situation",
      description:
        t.home?.outcome?.checklistDescription ||
        "See what to do this week, who to call, and what to bring to Jugendamt or court.",
      accent: "teal",
    },
    {
      tag: t.home?.outcome?.timelineTag || "Timeline",
      title: t.home?.outcome?.timelineTitle || "Timeline that keeps you on track",
      description:
        t.home?.outcome?.timelineDescription ||
        "Key dates, reminders, and optional calendar export so you never miss a filing window.",
      accent: "amber",
    },
  ];

  const proofItems: ProofItem[] = [
    {
      title: t.home?.proof?.legal || "Built on German family law (BGB)",
      description:
        t.home?.proof?.legalDescription ||
        "Each outcome cites the relevant §§ so you can speak with Jugendamt or court confidently.",
    },
    {
      title: t.home?.proof?.accessibility || "WCAG AA, multilingual, offline-ready",
      description:
        t.home?.proof?.accessibilityDescription ||
        "Seven languages, dark mode, reduced-motion mode, and works once loaded even without signal.",
    },
    {
      title: t.home?.proof?.privacy || "Privacy-first",
      description:
        t.home?.proof?.privacyDescription ||
        "No signup required. Your answers stay on your device unless you choose to share.",
    },
  ];

  return (
    <div className="w-full">
      {/* Animated Hero Section */}
      <AnimatedHero reduceMotion={reduceMotion}>
        <div className="space-y-7">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700 dark:text-zinc-300">
              {t.home?.heroRibbon || "Built from real family-law frustration"}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              {t.home?.heroTitle || "Understand Your Custody & Contact Rights in 6 Minutes"}
            </h1>
            <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 max-w-2xl">
              {t.home?.heroSubtitle ||
                "Guided interview, instant outcome with § references, and a court-ready PDF pack you can act on today."}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              {heroBadges.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/interview"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-amber-500 to-rose-500 text-white px-6 py-3 text-base font-semibold shadow-lg shadow-amber-200/40 dark:shadow-amber-900/30 hover:shadow-amber-200/70 dark:hover:shadow-amber-900/50 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{t.home.check}</span>
              </div>
            </Link>
            <Link
              href="/planning/checklist"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 px-6 py-3 text-base font-semibold hover:border-amber-400 dark:hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              {t.home?.heroSecondaryCta || "See a sample checklist"}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              {t.home?.heroSupporting || "No signup. No tracking. Built for stressed parents."}
            </span>
            <button
              type="button"
              className="underline decoration-dotted underline-offset-4 hover:text-amber-700 dark:hover:text-amber-300"
              onClick={() => setReduceMotion((prev) => !prev)}
            >
              {reduceMotion
                ? t.home?.motionEnabled || "Motion off — tap to enable"
                : t.home?.motionDisabled || "Prefer calm? Disable animations"}
            </button>
          </div>
        </div>
      </AnimatedHero>

      <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-14">
        <FadeIn delay={0.08}>
          <section className="grid lg:grid-cols-[1.3fr,1fr] gap-8 items-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                {t.home?.outcome?.eyebrow || "Outcome first"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {t.home?.outcome?.title || "See what you’ll walk away with"}
              </h2>
              <p className="text-base text-zinc-700 dark:text-zinc-300 max-w-2xl">
                {t.home?.outcome?.subtitle ||
                  "You get more than a score. Each answer shapes the PDF pack, timeline, and checklist you can use immediately."}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {outcomeItems.map((item) => (
                  <div
                    key={item.tag}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 shadow-sm shadow-zinc-100/60 dark:shadow-none"
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.accent === "amber"
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                          : "bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200"
                      }`}
                    >
                      {item.tag}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-amber-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-900/10 p-6 shadow-xl shadow-amber-100/50 dark:shadow-none">
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-50 bg-gradient-to-r from-amber-300/30 via-rose-200/20 to-emerald-300/30 dark:from-amber-500/10 dark:via-rose-500/10 dark:to-emerald-500/10" />
              <div className="relative space-y-4">
                <div className="rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 p-4 shadow-lg">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.12em]">
                    {t.home?.outcome?.previewHeader || "Preview"}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                      {t.home?.outcome?.previewPrimary || "Joint custody status with § references"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                      <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                      {t.home?.outcome?.previewSecondary || "Court cover letter pre-filled"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                      <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
                      {t.home?.outcome?.previewTertiary || "Checklist with deadlines & documents"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow">
                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      {t.home?.outcome?.cardStatus || "Status"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {t.home?.outcome?.cardStatusValue || "Eligible for joint custody"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {t.home?.outcome?.cardStatusCopy ||
                        "Includes §1626a BGB reference and your stated facts."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow">
                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      {t.home?.outcome?.cardChecklist || "Checklist"}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                      <li>• {t.home?.outcome?.cardItemOne || "Book Jugendamt appointment"}</li>
                      <li>• {t.home?.outcome?.cardItemTwo || "Bring IDs + birth certificate"}</li>
                      <li>• {t.home?.outcome?.cardItemThree || "Print & sign cover letter"}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.12}>
          <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 lg:p-8 shadow-lg shadow-amber-100/50 dark:shadow-none">
            <div className="grid lg:grid-cols-[1.2fr,1fr] gap-6 lg:gap-10 items-center">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  {t.home?.story?.eyebrow || "Why this exists"}
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {t.home?.story?.title || "I built this after being kept from my kids"}
                </h2>
                <p className="text-base text-zinc-700 dark:text-zinc-300">
                  {t.home?.story?.body ||
                    "I went months without seeing my children because I didn’t know the exact steps. This tool removes guesswork: the right § references, the right forms, the right sequence."}
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {t.home?.story?.note ||
                    "If you’re overwhelmed, start with the interview. You’ll leave with next steps you can act on today."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {proofItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-amber-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-4 shadow-sm"
                  >
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* How It Works & Features */}
        <div className="grid lg:grid-cols-2 gap-10">
          <FadeIn delay={0.16}>
            <HowItWorks />
          </FadeIn>
          <FadeIn delay={0.18}>
            <FeatureGrid />
          </FadeIn>
        </div>

        <FadeIn delay={0.2}>
          <TrustIndicators />
        </FadeIn>

        {/* Secondary CTAs */}
        <FadeIn delay={0.22}>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/learn"
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-700 dark:text-amber-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {t.home.learn}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                    {t.home?.learnDescription ||
                      "Access legal guides and official resources to understand your rights"}
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href="/directory"
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-700 dark:text-amber-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {t.home.support}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                    {t.home?.supportDescription ||
                      "Find local Jugendamt, courts, and support services near you"}
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href="/planning"
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-700 dark:text-amber-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {t.home?.planning || "Planning & Prevention"}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                    {t.home?.planningDescription ||
                      "Protect your parental rights before problems arise"}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </FadeIn>

        {/* Newsletter Signup */}
        <FadeIn delay={0.24}>
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-amber-50/70 dark:bg-amber-900/10 p-6 shadow-sm">
            <NewsletterSignup variant="default" />
          </div>
        </FadeIn>

        {/* Latest Stories Section */}
        {recentPosts.length > 0 && (
          <FadeIn delay={0.26}>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center text-zinc-900 dark:text-zinc-50">
                {t.home?.latestStoriesTitle || "Latest Stories"}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {recentPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                          {post.title}
                        </span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                          {post.readTime}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
