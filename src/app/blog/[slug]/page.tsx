"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import blogData from "@/data/blog.json";
import { formatDate } from "@/lib/utils";
import { use, useMemo } from "react";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: string;
  readTime: string;
  author: string;
  content: string;
  keywords?: string[];
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default function BlogPostPage({ params }: Props) {
  const { t } = useI18n();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const posts = blogData.posts as BlogPost[];
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const categories = {
    "personal-story": t.blog.categories.personalStory,
    "legal-guide": t.blog.categories.legalGuide,
    resource: t.blog.categories.resource,
  };

  const formattedDate = formatDate(post.published);

  // Simple markdown-like rendering (same as guides)
  const renderedContent = useMemo(() => {
    const lines = post.content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: "ul" | "ol" | null = null;

    lines.forEach((line, idx) => {
      if (line.startsWith("## ")) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className="list-disc list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100"
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-zinc-100"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className="list-disc list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100"
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100"
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        if (listType !== "ul") {
          if (listType === "ol" && currentList.length > 0) {
            elements.push(
              <ol
                key={`list-${idx}`}
                className="list-decimal list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100"
              >
                {currentList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            );
            currentList = [];
          }
          listType = "ul";
        }
        currentList.push(line.replace("- ", ""));
      } else if (line.match(/^\d+\. /)) {
        if (listType !== "ol") {
          if (listType === "ul" && currentList.length > 0) {
            elements.push(
              <ul
                key={`list-${idx}`}
                className="list-disc list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100"
              >
                {currentList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
            currentList = [];
          }
          listType = "ol";
        }
        currentList.push(line.replace(/^\d+\. /, ""));
      } else if (line.trim() === "") {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100`}
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        elements.push(<br key={`br-${idx}`} />);
      } else if (line.trim()) {
        if (currentList.length > 0) {
          const ListTag = listType === "ol" ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100`}
            >
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ListTag>
          );
          currentList = [];
          listType = null;
        }
        // Handle bold text with **text**
        const processedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        elements.push(
          <p
            key={`p-${idx}`}
            className="mb-3 text-zinc-900 dark:text-zinc-100"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    });

    if (currentList.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key="list-final"
          className={`${listType === "ol" ? "list-decimal" : "list-disc"} list-inside mb-3 space-y-1 ml-4 text-zinc-900 dark:text-zinc-100`}
        >
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    }

    return elements;
  }, [post.content]);

  return (
    <article className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <Link
          href="/blog"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline mb-4 inline-block"
        >
          {t.blog.backToBlog}
        </Link>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            {categories[post.category as keyof typeof categories] || post.category}
          </span>
          <span className="text-zinc-700 dark:text-zinc-400">{post.readTime}</span>
          <span className="text-zinc-700 dark:text-zinc-400">{formattedDate}</span>
          {post.author && (
            <span className="text-zinc-700 dark:text-zinc-400">
              {t.blog.by} {post.author}
            </span>
          )}
        </div>
        <p className="text-zinc-800 dark:text-zinc-300 mb-6 italic">{post.excerpt}</p>
      </div>

      {t.blog.languageNote && (
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-zinc-700 dark:text-zinc-300">
          <p>{t.blog.languageNote}</p>
        </div>
      )}

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <div className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">
          {renderedContent}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-300">
        <p>{t.blog.postDisclaimer}</p>
      </div>

      <div className="border-t border-zinc-300 dark:border-zinc-700 pt-6">
        <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
          {t.blog.aboutAuthor}
        </h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {t.blog.authorDescription.replace("{author}", post.author || "")}
        </p>
      </div>
    </article>
  );
}
