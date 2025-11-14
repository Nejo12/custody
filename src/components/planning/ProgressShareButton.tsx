"use client";

/**
 * Progress Share Button Component
 * Allows users to create and share a link to their planning checklist progress
 */

import { useState } from "react";
import { useI18n } from "@/i18n";

interface ProgressShareButtonProps {
  checklistId: string;
  email?: string;
  userId?: string;
}

/**
 * Component for sharing planning progress with partners or advisors
 */
export default function ProgressShareButton({
  checklistId,
  email,
  userId,
}: ProgressShareButtonProps) {
  const { t } = useI18n();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Create a shareable link for the progress
   */
  const handleCreateShareLink = async (): Promise<void> => {
    if (!email && !userId) {
      setError("Email or user ID is required to share progress");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/planning/progress/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checklistId,
          email,
          userId,
          expiresInDays: 30,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        shareUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create share link");
      }

      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy share URL to clipboard
   */
  const handleCopyLink = async (): Promise<void> => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      setError("Failed to copy link to clipboard");
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      {!shareUrl ? (
        <button
          onClick={handleCreateShareLink}
          disabled={isLoading || (!email && !userId)}
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Creating link..."
            : t.planning?.checklist?.createShareLink || "Create Share Link"}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              {copied ? t.planning?.checklist?.shareLinkCopied || "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {t.planning?.checklist?.shareLinkExpires?.replace("{days}", "30") ||
              "Link expires in 30 days"}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        {t.planning?.checklist?.shareDescription ||
          "Create a shareable link to show your progress to your partner or advisor."}
      </p>
    </div>
  );
}
