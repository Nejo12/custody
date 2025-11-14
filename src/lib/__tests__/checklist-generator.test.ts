/**
 * Tests for checklist generator library
 */

import { describe, it, expect } from "vitest";
import { generatePersonalizedChecklist, determineStage } from "../checklist-generator";
import type { UserSituation } from "@/types/planning";

describe("checklist-generator", () => {
  describe("determineStage", () => {
    it("should return early-warning if relationship is unstable", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: false,
      };

      expect(determineStage(situation)).toBe("early-warning");
    });

    it("should return expecting for pregnancy stages", () => {
      const situation: UserSituation = {
        relationshipStatus: "married",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      expect(determineStage(situation)).toBe("expecting");
    });

    it("should return at-birth for postpartum", () => {
      const situation: UserSituation = {
        relationshipStatus: "married",
        pregnancyStage: "postpartum",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      expect(determineStage(situation)).toBe("at-birth");
    });

    it("should return at-birth for 0-3 months child", () => {
      const situation: UserSituation = {
        relationshipStatus: "married",
        childAge: "0-3-months",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      expect(determineStage(situation)).toBe("at-birth");
    });

    it("should return first-year for 3-12 months child", () => {
      const situation: UserSituation = {
        relationshipStatus: "married",
        childAge: "6-12-months",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      expect(determineStage(situation)).toBe("first-year");
    });
  });

  describe("generatePersonalizedChecklist", () => {
    it("should generate checklist for unmarried expecting parents", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      const result = generatePersonalizedChecklist(situation);

      expect(result.situation).toEqual(situation);
      expect(result.priorityItems.length).toBeGreaterThan(0);
      expect(result.recommendedGuides.length).toBeGreaterThan(0);
      expect(result.nextSteps.length).toBeGreaterThan(0);

      // Should include paternity acknowledgment for unmarried
      const hasPaternityItem = result.priorityItems.some(
        (item) => item.id === "paternity-acknowledgment"
      );
      expect(hasPaternityItem).toBe(true);
    });

    it("should exclude paternity items for married couples", () => {
      const situation: UserSituation = {
        relationshipStatus: "married",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      const result = generatePersonalizedChecklist(situation);

      // Should not include paternity/custody items for married
      const hasPaternityItem = result.priorityItems.some(
        (item) => item.id === "paternity-acknowledgment"
      );
      const hasCustodyItem = result.priorityItems.some(
        (item) => item.id === "joint-custody-declaration"
      );

      expect(hasPaternityItem).toBe(false);
      expect(hasCustodyItem).toBe(false);
    });

    it("should exclude completed items", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: true,
        hasJointCustody: true,
        relationshipStable: true,
      };

      const result = generatePersonalizedChecklist(situation);

      // Should not include paternity/custody items if already completed
      const hasPaternityItem = result.priorityItems.some(
        (item) => item.id === "paternity-acknowledgment"
      );
      const hasCustodyItem = result.priorityItems.some(
        (item) => item.id === "joint-custody-declaration"
      );

      expect(hasPaternityItem).toBe(false);
      expect(hasCustodyItem).toBe(false);
    });

    it("should include early-warning items for unstable relationships", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        childAge: "1-2-years",
        hasPaternityCertificate: true,
        hasJointCustody: true,
        relationshipStable: false,
      };

      const result = generatePersonalizedChecklist(situation);

      // Should include early-warning items
      const hasEarlyWarningItem = result.priorityItems.some(
        (item) => item.stage === "early-warning"
      );
      expect(hasEarlyWarningItem).toBe(true);
    });

    it("should include city resources if city is provided", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
        city: "Berlin",
      };

      const result = generatePersonalizedChecklist(situation);

      expect(result.cityResources).toBeDefined();
      expect(result.cityResources?.city).toBe("Berlin");
    });

    it("should not include city resources if city is not provided", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      const result = generatePersonalizedChecklist(situation);

      expect(result.cityResources).toBeUndefined();
    });

    it("should prioritize items by urgency", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      const result = generatePersonalizedChecklist(situation);

      // Critical items should come before high priority items
      const criticalIndex = result.priorityItems.findIndex((item) => item.urgency === "critical");
      const highIndex = result.priorityItems.findIndex((item) => item.urgency === "high");

      if (criticalIndex !== -1 && highIndex !== -1) {
        expect(criticalIndex).toBeLessThan(highIndex);
      }
    });

    it("should generate next steps", () => {
      const situation: UserSituation = {
        relationshipStatus: "unmarried",
        pregnancyStage: "second-trimester",
        hasPaternityCertificate: false,
        hasJointCustody: false,
        relationshipStable: true,
      };

      const result = generatePersonalizedChecklist(situation);

      expect(result.nextSteps.length).toBeGreaterThan(0);
      expect(Array.isArray(result.nextSteps)).toBe(true);
    });
  });
});
