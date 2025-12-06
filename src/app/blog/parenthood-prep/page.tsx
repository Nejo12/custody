"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import blogData from "@/data/blog.json";
import { formatDate } from "@/lib/utils";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: string;
  readTime: string;
  author: string;
  thumbnailText?: string;
  microDescription?: string;
};

export default function ParenthoodPrepPage() {
  const { t } = useI18n();
  const pp = t.parenthoodPrep;

  const faqItems: { question: string; answer: string }[] = [
    {
      question: pp.faq.items.q1,
      answer: pp.faq.items.a1,
    },
    {
      question: pp.faq.items.q2,
      answer: pp.faq.items.a2,
    },
    {
      question: pp.faq.items.q3,
      answer: pp.faq.items.a3,
    },
    {
      question: pp.faq.items.q4,
      answer: pp.faq.items.a4,
    },
    {
      question: pp.faq.items.q5,
      answer: pp.faq.items.a5,
    },
    {
      question: pp.faq.items.q6,
      answer: pp.faq.items.a6,
    },
    {
      question: pp.faq.items.q7,
      answer: pp.faq.items.a7,
    },
    {
      question: pp.faq.items.q8,
      answer: pp.faq.items.a8,
    },
  ];

  const missionBullets = [
    pp.mission.bullets.bullet1,
    pp.mission.bullets.bullet2,
    pp.mission.bullets.bullet3,
    pp.mission.bullets.bullet4,
    pp.mission.bullets.bullet5,
  ];
  const posts = (blogData.posts as BlogPost[])
    .filter((post) => post.category === "parenthood-prep")
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-4 rounded-2xl border border-amber-200/70 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/30 p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-[0.08em] dark:bg-amber-900/40 dark:text-amber-200">
          {pp.badge}
        </div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{pp.title}</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-200">{pp.subtitle}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{pp.description}</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
            {pp.mission.label}
          </p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {pp.mission.title}
          </h2>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {pp.mission.description}
        </p>
        <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
          {missionBullets.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {pp.mission.conclusion}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              {pp.section.label}
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {pp.section.title}
            </h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{pp.section.description}</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {pp.section.viewAllPosts}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    {pp.badge}
                  </span>
                  <span>{post.readTime}</span>
                  <span>{formatDate(post.published)}</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {post.microDescription || post.excerpt}
                </p>
                {post.thumbnailText && (
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    {post.thumbnailText}
                  </p>
                )}
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {post.author ? `${t.blog.by} ${post.author}` : ""}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
                  aria-label={`Read ${post.title}`}
                >
                  {pp.section.readArticle}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
            {pp.faq.label}
          </p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{pp.faq.title}</h2>
        </div>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={item.question} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold dark:bg-amber-900/40 dark:text-amber-200">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.question}</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
