/**
 * Thank‑you page implemented as a Server Component to avoid
 * client hooks. Reads search params from the Page props.
 */
export default function ThanksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pickParam = (key: string): string | undefined => {
    const v = searchParams[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v[0];
    return undefined;
  };

  const refCode = pickParam("ref") || pickParam("partner") || pickParam("utm_campaign");

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-zinc-500 dark:text-zinc-400">
        Thank you for visiting!
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
        {refCode
          ? `Your referral/campaign code: ${refCode}`
          : "We appreciate your interest in Custody Clarity."}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
        Start the interview to get your result in minutes.
      </p>
      <div className="mt-6">
        <a
          href="/interview"
          className="inline-block rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-700 px-6 py-3 text-sm hover:bg-black dark:hover:bg-white"
        >
          Begin Interview
        </a>
      </div>
    </div>
  );
}
