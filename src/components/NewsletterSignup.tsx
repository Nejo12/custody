"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
  onSuccess?: () => void;
}

/**
 * Newsletter signup component
 * Collects email addresses for marketing/updates
 */
export default function NewsletterSignup({
  variant = "default",
  className = "",
  onSuccess,
}: NewsletterSignupProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate email format more strictly
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMessage(t.newsletter?.errorInvalidEmail || "Please enter a valid email address");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || t.newsletter?.errorFailed || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
      onSuccess?.();

      // Track newsletter signup event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "newsletter_signup", {
          method: variant,
        });
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t.newsletter?.errorGeneric || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // Compact variant (minimal UI)
  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.newsletter?.emailPlaceholder || "Your email"}
          className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          disabled={loading || status === "success"}
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={loading || status === "success"}
          className="rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-4 py-2 text-sm font-medium hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : status === "success" ? "✓" : t.newsletter?.subscribe || "Subscribe"}
        </button>
      </form>
    );
  }

  // Inline variant (single line with message)
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.newsletter?.emailPlaceholder || "Your email"}
            className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            disabled={loading || status === "success"}
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={loading || status === "success"}
            className="rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-4 py-2 text-sm font-medium hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading
              ? t.newsletter?.subscribing || "Subscribing..."
              : status === "success"
                ? t.newsletter?.subscribed || "Subscribed!"
                : t.newsletter?.subscribe || "Subscribe"}
          </button>
        </div>
        {status === "error" && errorMessage && (
          <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-xs text-green-600 dark:text-green-400">
            {t.newsletter?.successMessage || "Thank you! Check your email for confirmation."}
          </p>
        )}
      </form>
    );
  }

  // Default variant (full card with description)
  return (
    <div
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold mb-2 text-zinc-500 dark:text-zinc-400">
        {t.newsletter?.title || "Stay Updated"}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        {t.newsletter?.description ||
          "Get updates on custody rights, legal changes, and new features."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.newsletter?.emailPlaceholder || "Your email address"}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            disabled={loading || status === "success"}
            aria-label="Email address"
          />
        </div>
        <button
          type="submit"
          disabled={loading || status === "success"}
          className="w-full rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-4 py-2 text-sm font-medium hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? t.newsletter?.subscribing || "Subscribing..."
            : status === "success"
              ? t.newsletter?.subscribed || "Subscribed!"
              : t.newsletter?.subscribe || "Subscribe"}
        </button>
        {status === "error" && errorMessage && (
          <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-xs text-green-600 dark:text-green-400">
            {t.newsletter?.successMessage || "Thank you! Check your email for confirmation."}
          </p>
        )}
      </form>
    </div>
  );
}
