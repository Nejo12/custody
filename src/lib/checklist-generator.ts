/**
 * Checklist Generator Library
 * Generates personalized checklists based on user's situation
 */

import type {
  UserSituation,
  ChecklistItem,
  PlanningGuide,
  CityResource,
  PersonalizedChecklist,
  PlanningStage,
} from "@/types/planning";
import planningData from "@/data/planning.json";

/**
 * Determine the primary planning stage based on user situation
 */
function determineStage(situation: UserSituation): PlanningStage {
  // If relationship is unstable, prioritize early-warning stage
  if (!situation.relationshipStable) {
    return "early-warning";
  }

  // Determine stage based on pregnancy/child age
  if (situation.pregnancyStage) {
    switch (situation.pregnancyStage) {
      case "planning":
      case "first-trimester":
      case "second-trimester":
      case "third-trimester":
        return "expecting";
      case "postpartum":
        return "at-birth";
    }
  }

  if (situation.childAge) {
    switch (situation.childAge) {
      case "not-born":
        return "expecting";
      case "0-3-months":
        return "at-birth";
      case "3-6-months":
      case "6-12-months":
        return "first-year";
      case "1-2-years":
      case "older":
        // If older child but relationship unstable, still early-warning
        return situation.relationshipStable ? "first-year" : "early-warning";
    }
  }

  // Default to expecting if no clear stage
  return "expecting";
}

/**
 * Filter checklist items based on user situation
 */
function filterChecklistItems(
  allItems: ChecklistItem[],
  situation: UserSituation
): ChecklistItem[] {
  const relevantItems: ChecklistItem[] = [];
  const stage = determineStage(situation);

  for (const item of allItems) {
    let shouldInclude = false;

    // Always include early-warning items if relationship is unstable
    if (item.stage === "early-warning" && !situation.relationshipStable) {
      shouldInclude = true;
    }

    // Include items for the determined stage
    if (item.stage === stage) {
      shouldInclude = true;
    }

    // Skip items that are already completed
    if (item.id === "paternity-acknowledgment" && situation.hasPaternityCertificate) {
      shouldInclude = false;
    }

    if (item.id === "joint-custody-declaration" && situation.hasJointCustody) {
      shouldInclude = false;
    }

    // If married, skip paternity/custody items (automatic)
    if (situation.relationshipStatus === "married") {
      if (item.id === "paternity-acknowledgment" || item.id === "joint-custody-declaration") {
        shouldInclude = false;
      }
    }

    // If unmarried and no paternity, paternity is critical
    if (
      situation.relationshipStatus === "unmarried" &&
      !situation.hasPaternityCertificate &&
      item.id === "paternity-acknowledgment"
    ) {
      shouldInclude = true;
    }

    // If unmarried and no joint custody, joint custody is critical
    if (
      situation.relationshipStatus === "unmarried" &&
      !situation.hasJointCustody &&
      item.id === "joint-custody-declaration"
    ) {
      shouldInclude = true;
    }

    if (shouldInclude) {
      relevantItems.push(item);
    }
  }

  return relevantItems;
}

/**
 * Sort checklist items by priority (urgency and stage relevance)
 */
function prioritizeItems(items: ChecklistItem[], situation: UserSituation): ChecklistItem[] {
  const urgencyOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return items.sort((a, b) => {
    // First sort by urgency
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgencyDiff !== 0) {
      return urgencyDiff;
    }

    // Then by stage relevance
    const stage = determineStage(situation);
    if (a.stage === stage && b.stage !== stage) {
      return -1;
    }
    if (a.stage !== stage && b.stage === stage) {
      return 1;
    }

    // Finally by title alphabetically
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get recommended guides based on user situation
 */
function getRecommendedGuides(
  allGuides: PlanningGuide[],
  situation: UserSituation
): PlanningGuide[] {
  const recommended: PlanningGuide[] = [];
  const stage = determineStage(situation);

  // Always recommend guides for the current stage
  for (const guide of allGuides) {
    if (guide.stage === stage) {
      recommended.push(guide);
    }
  }

  // If unmarried, prioritize unmarried couples guide
  if (situation.relationshipStatus === "unmarried") {
    const unmarriedGuide = allGuides.find((g) => g.slug === "unmarried-couples-essential-guide");
    if (unmarriedGuide && !recommended.includes(unmarriedGuide)) {
      recommended.unshift(unmarriedGuide);
    }
  }

  // If relationship unstable, prioritize emergency guide
  if (!situation.relationshipStable) {
    const emergencyGuide = allGuides.find(
      (g) => g.slug === "relationship-trouble-protect-your-rights"
    );
    if (emergencyGuide && !recommended.includes(emergencyGuide)) {
      recommended.unshift(emergencyGuide);
    }
  }

  // Limit to top 5 most relevant
  return recommended.slice(0, 5);
}

/**
 * Get city resources if city is provided
 */
function getCityResources(city?: string): CityResource | undefined {
  if (!city) {
    return undefined;
  }

  const cityLower = city.toLowerCase().trim();
  const resources = planningData.cityResources as CityResource[];

  // Try exact match first
  let resource = resources.find((r) => r.city.toLowerCase() === cityLower);

  // Try partial match
  if (!resource) {
    resource = resources.find(
      (r) => r.city.toLowerCase().includes(cityLower) || cityLower.includes(r.city.toLowerCase())
    );
  }

  return resource;
}

/**
 * Generate next steps based on situation
 */
function generateNextSteps(situation: UserSituation, priorityItems: ChecklistItem[]): string[] {
  const steps: string[] = [];

  // Determine immediate next step
  if (priorityItems.length > 0) {
    const firstItem = priorityItems[0];
    steps.push(`Start with: ${firstItem.title}`);
  }

  // Add situation-specific guidance
  if (situation.relationshipStatus === "unmarried" && !situation.hasPaternityCertificate) {
    steps.push("Schedule appointment at Jugendamt for paternity acknowledgment");
  }

  if (
    situation.relationshipStatus === "unmarried" &&
    situation.hasPaternityCertificate &&
    !situation.hasJointCustody
  ) {
    steps.push("Complete joint custody declaration at Jugendamt");
  }

  if (!situation.relationshipStable) {
    steps.push("Document all interactions and childcare involvement");
    steps.push("Consider legal consultation for immediate protection");
  }

  if (situation.city) {
    steps.push(`Find local resources for ${situation.city}`);
  } else {
    steps.push("Search for local Jugendamt and Standesamt in your city");
  }

  return steps;
}

/**
 * Generate a personalized checklist based on user situation
 */
export function generatePersonalizedChecklist(situation: UserSituation): PersonalizedChecklist {
  const allItems = planningData.checklist as ChecklistItem[];
  const allGuides = planningData.guides as PlanningGuide[];

  // Filter and prioritize checklist items
  const filteredItems = filterChecklistItems(allItems, situation);
  const priorityItems = prioritizeItems(filteredItems, situation);

  // Get recommended guides
  const recommendedGuides = getRecommendedGuides(allGuides, situation);

  // Get city resources if available
  const cityResources = getCityResources(situation.city);

  // Generate next steps
  const nextSteps = generateNextSteps(situation, priorityItems);

  return {
    situation,
    priorityItems,
    recommendedGuides,
    cityResources,
    nextSteps,
  };
}

/**
 * Export the determineStage function for use in components
 */
export { determineStage };
