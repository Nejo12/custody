"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { buildICS } from "@/lib/ics";
import { trackEvent } from "@/components/Analytics";

interface CourtReminderButtonProps {
  email?: string;
  defaultDate?: Date;
  summary?: string;
  description?: string;
  className?: string;
}

/**
 * Court reminder button component
 * Allows users to download ICS file and/or schedule email reminder
 */
export default function CourtReminderButton({
  email,
  defaultDate,
  summary = "Court filing (draft)",
  description,
  className = "",
}: CourtReminderButtonProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [reminderEmail, setReminderEmail] = useState(email || "");
  const [reminderDate, setReminderDate] = useState(
    defaultDate
      ? defaultDate.toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Download ICS file
  const handleDownloadICS = () => {
    const date = new Date(reminderDate);
    const ics = buildICS({
      summary,
      startISO: date.toISOString(),
      durationMinutes: 30,
    });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filing-reminder.ics";
    a.click();
    URL.revokeObjectURL(url);

    // Track ICS download
    trackEvent("court_reminder_ics_download", {
      has_email: !!email,
    });
  };

  // Schedule email reminder
  const handleScheduleEmailReminder = async () => {
    // Use provided email or state email
    const emailToUse = email || reminderEmail;

    // Validate email format more strictly
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailToUse || !emailRegex.test(emailToUse.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      // If email was provided but invalid, show the input form
      if (email) {
        setShowEmailInput(true);
        setReminderEmail("");
      }
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/reminders/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || reminderEmail,
          reminderDate: new Date(reminderDate).toISOString(),
          summary,
          description,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to schedule reminder");
      }

      setStatus("success");
      setShowEmailInput(false);

      // Track email reminder scheduling
      trackEvent("court_reminder_email_scheduled", {
        reminder_date: reminderDate,
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleDownloadICS}
          className="text-xs underline text-zinc-300 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          {t.result.addFilingReminder || "Add filing reminder"}
        </button>
        {!email && (
          <button
            onClick={() => setShowEmailInput(!showEmailInput)}
            className="text-xs underline text-zinc-300 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            {showEmailInput
              ? t.result.cancelEmailReminder || "Cancel"
              : t.result.scheduleEmailReminder || "Schedule email reminder"}
          </button>
        )}
      </div>

      {showEmailInput && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2">
          <div>
            <label
              htmlFor="reminder-email"
              className="block text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400"
            >
              {t.result.emailForReminder || "Email for reminder"}
            </label>
            <input
              id="reminder-email"
              type="email"
              value={reminderEmail}
              onChange={(e) => setReminderEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              required
            />
          </div>
          <div>
            <label
              htmlFor="reminder-date"
              className="block text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400"
            >
              {t.result.reminderDate || "Reminder date"}
            </label>
            <input
              id="reminder-date"
              type="datetime-local"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              required
            />
          </div>
          <button
            onClick={handleScheduleEmailReminder}
            disabled={loading || status === "success"}
            className="w-full rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? t.result.scheduling || "Scheduling..."
              : status === "success"
                ? t.result.scheduled || "Scheduled!"
                : t.result.scheduleReminder || "Schedule Reminder"}
          </button>
          {status === "error" && errorMessage && (
            <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
          )}
          {status === "success" && (
            <p className="text-xs text-green-600 dark:text-green-400">
              {t.result.reminderScheduled ||
                "Reminder scheduled! You'll receive an email on the specified date."}
            </p>
          )}
        </div>
      )}

      {email && !showEmailInput && (
        <div className="space-y-2">
          <button
            onClick={handleScheduleEmailReminder}
            disabled={loading || status === "success"}
            className="text-xs underline text-zinc-300 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
          >
            {loading
              ? t.result.scheduling || "Scheduling..."
              : status === "success"
                ? t.result.scheduled || "Scheduled!"
                : t.result.scheduleEmailReminder || "Schedule email reminder"}
          </button>
          {status === "error" && errorMessage && (
            <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
          )}
          {status === "success" && (
            <p className="text-xs text-green-600 dark:text-green-400">
              {t.result.reminderScheduled ||
                "Reminder scheduled! You'll receive an email on the specified date."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
