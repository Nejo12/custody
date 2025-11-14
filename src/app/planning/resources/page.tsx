"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import planningDataEn from "@/data/planning.json";
import type { CityResource } from "@/types/planning";
import { trackEvent } from "@/components/Analytics";

/**
 * Lazy load locale-specific planning data
 * Loads translated city resources based on current locale
 * Falls back to English if translation unavailable
 */
const loadPlanning = async (locale: string) => {
  if (locale === "de") {
    try {
      return (await import("@/data/planning.de.json")).default;
    } catch {
      console.warn("German planning data not found, falling back to English");
      return planningDataEn;
    }
  }

  if (locale === "ar") {
    try {
      return (await import("@/data/planning.ar.json")).default;
    } catch {
      console.warn("Arabic planning data not found, falling back to English");
      return planningDataEn;
    }
  }

  // Default to English for all other locales
  return planningDataEn;
};

/**
 * City Resources Page
 * Allows users to search for local Jugendamt and Standesamt by city or postcode
 */
export default function ResourcesPage() {
  // Get i18n translation function and current locale
  const { t, locale } = useI18n();

  // State for locale-specific planning data
  const [planningData, setPlanningData] = useState(planningDataEn);

  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load locale-specific data when locale changes
  useEffect(() => {
    loadPlanning(locale).then((data) => setPlanningData(data));
  }, [locale]);

  // Get city resources from planning data
  const cityResources = planningData.cityResources as CityResource[];

  /**
   * Filter resources based on search query
   * Searches in city name and postcode
   */
  const filteredResources = cityResources.filter((resource) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // Show all if no search query

    return resource.city.toLowerCase().includes(query) || resource.postcode.includes(query);
  });

  /**
   * Track search analytics when search query changes
   */
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        trackEvent("planning_resource_searched", {
          query: searchQuery.trim(),
          resultsCount: filteredResources.length,
          locale,
        });
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, filteredResources.length, locale]);

  /**
   * Track page view on mount
   */
  useEffect(() => {
    trackEvent("planning_resources_page_viewed", {
      locale,
      totalCities: cityResources.length,
    });
  }, [locale, cityResources.length]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/planning"
        className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors inline-block"
      >
        {t.planning?.backToPlanning || "← Back to Planning"}
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
          {t.planning?.cityResources?.title || "Find Local Resources"}
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          {t.planning?.cityResources?.description ||
            "Find your local Jugendamt, Standesamt, and other family services. Search by city or postcode."}
        </p>
      </div>

      {/* Search box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            t.planning?.cityResources?.searchPlaceholder || "Enter city name or postcode"
          }
          className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Search for city or postcode"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 space-y-6"
            >
              {/* City header */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {resource.city}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Postcode: {resource.postcode}
                  </p>
                </div>
              </div>

              {/* Standesamt section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.planning?.cityResources?.standesamt?.title ||
                        "Standesamt (Registry Office)"}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t.planning?.cityResources?.standesamt?.description ||
                        "Birth registration, marriage, paternity acknowledgment"}
                    </p>
                  </div>
                </div>

                <div className="ml-10 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">
                      {resource.standesamt.name}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {resource.standesamt.address && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.address || "Address"}:
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {resource.standesamt.address}
                        </span>
                      </div>
                    )}

                    {resource.standesamt.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.phone || "Phone"}:
                        </span>
                        <a
                          href={`tel:${resource.standesamt.phone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {resource.standesamt.phone}
                        </a>
                      </div>
                    )}

                    {resource.standesamt.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.email || "Email"}:
                        </span>
                        <a
                          href={`mailto:${resource.standesamt.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {resource.standesamt.email}
                        </a>
                      </div>
                    )}

                    {resource.standesamt.website && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.website || "Website"}:
                        </span>
                        <a
                          href={resource.standesamt.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Visit website →
                        </a>
                      </div>
                    )}

                    {resource.standesamt.hours && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.hours || "Hours"}:
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {resource.standesamt.hours}
                        </span>
                      </div>
                    )}

                    {resource.standesamt.appointmentRequired && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-medium">
                        ⚠️{" "}
                        {t.planning?.cityResources?.appointmentRequired || "Appointment Required"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Jugendamt section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.planning?.cityResources?.jugendamt?.title ||
                        "Jugendamt (Youth Welfare Office)"}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t.planning?.cityResources?.jugendamt?.description ||
                        "Custody declarations, mediation, family counseling"}
                    </p>
                  </div>
                </div>

                <div className="ml-10 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">
                      {resource.jugendamt.name}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {resource.jugendamt.address && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.address || "Address"}:
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {resource.jugendamt.address}
                        </span>
                      </div>
                    )}

                    {resource.jugendamt.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.phone || "Phone"}:
                        </span>
                        <a
                          href={`tel:${resource.jugendamt.phone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {resource.jugendamt.phone}
                        </a>
                      </div>
                    )}

                    {resource.jugendamt.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.email || "Email"}:
                        </span>
                        <a
                          href={`mailto:${resource.jugendamt.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {resource.jugendamt.email}
                        </a>
                      </div>
                    )}

                    {resource.jugendamt.website && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.website || "Website"}:
                        </span>
                        <a
                          href={resource.jugendamt.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Visit website →
                        </a>
                      </div>
                    )}

                    {resource.jugendamt.hours && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {t.planning?.cityResources?.hours || "Hours"}:
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {resource.jugendamt.hours}
                        </span>
                      </div>
                    )}

                    {resource.jugendamt.appointmentRequired && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-medium">
                        ⚠️{" "}
                        {t.planning?.cityResources?.appointmentRequired || "Appointment Required"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special notes (if available) */}
              {resource.notes && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        {t.planning?.cityResources?.notes || "Notes"}
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-400">{resource.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          // No results found
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {t.planning?.cityResources?.noResultsFound || "No resources found for this location"}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.planning?.cityResources?.tryDifferentSearch || "Try a different city or postcode"}
            </p>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-400">
        <p className="mb-2">
          <strong>💡 {t.planning?.checklist?.tip || "Tip"}:</strong>{" "}
          {t.planning?.cityResources?.cityNotFoundTip ||
            "Can't find your city? These are sample resources for major cities."}
        </p>
        <p>
          {t.planning?.cityResources?.cityNotFoundHelp ||
            'Contact your local city administration (Bürgeramt) or search online for "Jugendamt [your city]" or "Standesamt [your city]" to find your local offices.'}
        </p>
      </div>
    </div>
  );
}
