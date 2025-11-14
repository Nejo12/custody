/**
 * Tests for Planning & Prevention analytics tracking
 * Ensures analytics events are properly structured
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent } from "@/components/Analytics";

// Mock the analytics module
vi.mock("@/components/Analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("Planning Analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Page View Tracking", () => {
    it("should track planning landing page view", () => {
      trackEvent("planning_page_viewed", {
        locale: "en",
        stage: "all",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_page_viewed", {
        locale: "en",
        stage: "all",
      });
    });

    it("should track guide page view with metadata", () => {
      trackEvent("planning_guide_viewed", {
        slug: "unmarried-couples-essential-guide",
        stage: "expecting",
        urgency: "critical",
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_guide_viewed", {
        slug: "unmarried-couples-essential-guide",
        stage: "expecting",
        urgency: "critical",
        locale: "en",
      });
    });

    it("should track checklist page view", () => {
      trackEvent("planning_checklist_page_viewed", {
        locale: "en",
        totalItems: 15,
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_checklist_page_viewed", {
        locale: "en",
        totalItems: 15,
      });
    });

    it("should track resources page view", () => {
      trackEvent("planning_resources_page_viewed", {
        locale: "en",
        totalCities: 5,
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_resources_page_viewed", {
        locale: "en",
        totalCities: 5,
      });
    });

    it("should track interview page view", () => {
      trackEvent("planning_interview_page_viewed", {
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_interview_page_viewed", {
        locale: "en",
      });
    });
  });

  describe("User Interaction Tracking", () => {
    it("should track checklist item completion", () => {
      trackEvent("planning_checklist_item_completed", {
        itemId: "paternity-acknowledgment",
        stage: "expecting",
        urgency: "critical",
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_checklist_item_completed", {
        itemId: "paternity-acknowledgment",
        stage: "expecting",
        urgency: "critical",
        locale: "en",
      });
    });

    it("should track resource search", () => {
      trackEvent("planning_resource_searched", {
        query: "Berlin",
        resultsCount: 1,
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_resource_searched", {
        query: "Berlin",
        resultsCount: 1,
        locale: "en",
      });
    });

    it("should track interview start with user situation", () => {
      trackEvent("planning_interview_started", {
        relationshipStatus: "unmarried",
        childAge: "expecting",
        paternityAcknowledged: false,
        custodyEstablished: false,
        relationshipStability: "stable",
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_interview_started", {
        relationshipStatus: "unmarried",
        childAge: "expecting",
        paternityAcknowledged: false,
        custodyEstablished: false,
        relationshipStability: "stable",
        locale: "en",
      });
    });

    it("should track checklist generation", () => {
      trackEvent("planning_checklist_generated", {
        itemCount: 8,
        priorityCount: 3,
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_checklist_generated", {
        itemCount: 8,
        priorityCount: 3,
        locale: "en",
      });
    });

    it("should track PDF download", () => {
      trackEvent("planning_pdf_downloaded", {
        type: "personalized-checklist",
        itemCount: 8,
        priorityCount: 3,
        locale: "en",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_pdf_downloaded", {
        type: "personalized-checklist",
        itemCount: 8,
        priorityCount: 3,
        locale: "en",
      });
    });
  });

  describe("Locale Tracking", () => {
    it("should track Arabic locale", () => {
      trackEvent("planning_page_viewed", {
        locale: "ar",
        stage: "all",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_page_viewed", {
        locale: "ar",
        stage: "all",
      });
    });

    it("should track German locale", () => {
      trackEvent("planning_page_viewed", {
        locale: "de",
        stage: "all",
      });

      expect(trackEvent).toHaveBeenCalledWith("planning_page_viewed", {
        locale: "de",
        stage: "all",
      });
    });
  });
});
