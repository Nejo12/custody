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
};

export default function BlogPage() {
  const { t } = useI18n();
  const posts = blogData.posts as BlogPost[];

  const categories = {
    "personal-story": t.blog.categories.personalStory,
    "legal-guide": t.blog.categories.legalGuide,
    resource: t.blog.categories.resource,
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-500 dark:text-zinc-400">
          {t.blog.title}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-500">{t.blog.description}</p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 hover:underline block mb-2"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-zinc-700 dark:text-zinc-500 mb-3">{post.excerpt}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {categories[post.category as keyof typeof categories] || post.category}
              </span>
              <span className="text-zinc-700 dark:text-zinc-400">{post.readTime}</span>
              <span className="text-zinc-700 dark:text-zinc-400">{formatDate(post.published)}</span>
              {post.author && (
                <span className="text-zinc-700 dark:text-zinc-400">
                  {t.blog.by} {post.author}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {t.blog.languageNote && (
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-700 dark:text-zinc-500">
          <p>{t.blog.languageNote}</p>
        </div>
      )}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-500">
        <p>{t.blog.disclaimer}</p>
      </div>
    </div>
  );
}
