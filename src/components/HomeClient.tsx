"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import FadeIn from "@/components/FadeIn";
import NewsletterSignup from "@/components/NewsletterSignup";
import HowItWorks from "@/components/HowItWorks";
import FeatureGrid from "@/components/FeatureGrid";
import TrustIndicators from "@/components/TrustIndicators";
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

/**
 * HomeClient Component
 * Main landing page component with enhanced hero, how it works, features, and CTAs
 */
export default function HomeClient() {
  const { t } = useI18n();

  // Get 2 most recent blog posts sorted by published date (descending)
  const recentPosts = (blogData.posts as BlogPost[])
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, 2);
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10 space-y-12">
      {/* Enhanced Hero Section */}
      <FadeIn>
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.home?.heroTitle || "Understand Your Custody Rights in 6 Minutes"}
          </h1>
          <p className="text-base text-zinc-700 dark:text-zinc-400 max-w-lg mx-auto">
            {t.home?.heroSubtitle ||
              "Free guided interview with instant legal results and BGB citations"}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
              {t.home?.subline || "Takes 6 minutes. No signup."}
            </span>
            <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
              {t.home?.features || "WCAG AA · Privacy‑first · Offline‑ready"}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Primary CTA */}
      <FadeIn delay={0.05}>
        <Link
          href="/interview"
          className="block rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 p-4 text-center font-medium hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-black dark:hover:bg-white transition-colors"
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
      </FadeIn>

      {/* How It Works Section */}
      <FadeIn delay={0.1}>
        <HowItWorks />
      </FadeIn>

      {/* Feature Grid Section */}
      <FadeIn delay={0.15}>
        <FeatureGrid />
      </FadeIn>

      {/* Trust Indicators */}
      <FadeIn delay={0.2}>
        <TrustIndicators />
      </FadeIn>

      {/* Secondary CTAs */}
      <FadeIn delay={0.25}>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/learn"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-zinc-700 dark:text-zinc-300"
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
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {t.home.learn}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {t.home?.learnDescription ||
                    "Access legal guides and official resources to understand your rights"}
                </div>
              </div>
            </div>
          </Link>
          <Link
            href="/directory"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-zinc-700 dark:text-zinc-300"
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
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {t.home.support}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {t.home?.supportDescription ||
                    "Find local Jugendamt, courts, and support services near you"}
                </div>
              </div>
            </div>
          </Link>
          <Link
            href="/planning"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-zinc-700 dark:text-zinc-300"
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
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {t.home?.planning || "Planning & Prevention"}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {t.home?.planningDescription ||
                    "Protect your parental rights before problems arise"}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </FadeIn>

      {/* Newsletter Signup */}
      <FadeIn delay={0.3}>
        <div>
          <NewsletterSignup variant="default" />
        </div>
      </FadeIn>

      {/* Latest Stories Section */}
      {recentPosts.length > 0 && (
        <FadeIn delay={0.35}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-zinc-900 dark:text-zinc-50">
              {t.home?.latestStoriesTitle || "Latest Stories"}
            </h2>
            <ul className="space-y-2">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {post.title}
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-shrink-0">
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
  );
}
