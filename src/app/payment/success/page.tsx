"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { trackConversion } from "@/components/Analytics";

function PaymentSuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentStatus?: string;
    paymentMethod?: string;
  }>({});
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    // Verify the session
    fetch(`/api/payment/verify-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setPaymentInfo({
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod,
          });

          // Track conversion in analytics
          if (data.amount && data.currency) {
            trackConversion(data.amount, data.currency, sessionId || undefined);
          }
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">{t.paymentSuccess.verifying}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          {t.paymentSuccess.verificationFailed}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          {t.paymentSuccess.verificationFailedMessage}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/result"
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-black dark:hover:bg-white transition"
          >
            {t.paymentSuccess.goToResults}
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            {t.paymentSuccess.goHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          {paymentInfo.paymentMethod === "sepa_debit"
            ? t.paymentSuccess.paymentInitiated
            : t.paymentSuccess.paymentSuccessful}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          {paymentInfo.paymentMethod === "sepa_debit"
            ? t.paymentSuccess.sepaProcessing
            : t.paymentSuccess.thankYou}
        </p>
      </div>

      {paymentInfo.paymentMethod === "sepa_debit" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                {t.paymentSuccess.sepaProcessingTitle}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t.paymentSuccess.sepaProcessingMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          {t.paymentSuccess.whatHappensNext}
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <strong>{t.paymentSuccess.step1Title}</strong>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {paymentInfo.paymentMethod === "sepa_debit"
                  ? t.paymentSuccess.step1MessageSepa
                  : t.paymentSuccess.step1Message}
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <strong className="text-zinc-900 dark:text-zinc-100">
                {t.paymentSuccess.step2Title}
              </strong>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {t.paymentSuccess.step2Message}
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <strong className="text-zinc-900 dark:text-zinc-100">
                {t.paymentSuccess.step3Title}
              </strong>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {t.paymentSuccess.step3Message}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
        <div className="flex gap-3">
          <span className="text-2xl">📧</span>
          <div>
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
              {t.paymentSuccess.emailNotReceived}
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <li>• {t.paymentSuccess.emailNotReceivedTip1}</li>
              <li>• {t.paymentSuccess.emailNotReceivedTip2}</li>
              <li>• {t.paymentSuccess.emailNotReceivedTip3}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/result"
          className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-black dark:hover:bg-white transition text-center font-medium"
        >
          {t.paymentSuccess.viewResults}
        </Link>
        <Link
          href="/"
          className="px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-center font-medium"
        >
          {t.paymentSuccess.returnHome}
        </Link>
      </div>

      <div className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>{t.paymentSuccess.needHelp}</p>
        <p className="mt-2">
          {t.paymentSuccess.sessionId} {sessionId}
        </p>
      </div>
    </div>
  );
}

function PaymentSuccessFallback() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-4"></div>
        <p className="text-lg text-zinc-700 dark:text-zinc-300">{t.paymentSuccess.loading}</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
