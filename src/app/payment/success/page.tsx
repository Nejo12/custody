"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    // Verify the session
    fetch(`/api/payment/verify-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => (data.success ? setStatus("success") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold mb-4">Payment Verification Failed</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We couldn&apos;t verify your payment. If you were charged, don&apos;t worry - we&apos;ll
          send your document to your email shortly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/result"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Go to Results
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:opacity-90 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Thank you for your purchase</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">What happens next?</h2>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <strong>Check your email</strong>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We&apos;ve sent a confirmation to your email address. Your document will arrive
                within 5-10 minutes.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <strong>Review your document</strong>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Open the PDF attachment and review all the information carefully.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <strong>Submit to authorities</strong>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Follow the instructions in the document to submit it to the appropriate court or
                office.
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
              Haven&apos;t received your email?
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Wait up to 10 minutes for delivery</li>
              <li>• Contact support@custodyclarity.com if you still don&apos;t receive it</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/result"
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition text-center font-medium"
        >
          View Your Results
        </Link>
        <Link
          href="/"
          className="px-8 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:opacity-90 transition text-center font-medium"
        >
          Return Home
        </Link>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Need help? Email us at support@custodyclarity.com</p>
        <p className="mt-2">Session ID: {sessionId}</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
