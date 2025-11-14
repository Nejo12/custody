/**
 * Types for the Planning & Prevention section
 * Supporting expectant parents and early family planning
 */

/**
 * Stages in the parenting journey where legal planning is critical
 */
export type PlanningStage =
  | "expecting" // Pregnant or planning pregnancy
  | "at-birth" // Birth registration and immediate steps
  | "first-year" // Legal protections in baby's first year
  | "early-warning"; // Relationship trouble - secure rights now

/**
 * Urgency level for guides and checklist items
 */
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

/**
 * Planning guide structure
 */
export interface PlanningGuide {
  slug: string;
  title: string;
  excerpt: string;
  stage: PlanningStage;
  urgency: UrgencyLevel;
  published: string;
  readTime: string;
  content: string;
  requiredDocuments?: string[]; // Documents needed for this step
  relatedGuides?: string[]; // Slugs of related guides
}

/**
 * Checklist item for interactive prevention checklist
 */
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  stage: PlanningStage;
  urgency: UrgencyLevel;
  requiredFor?: string[]; // What this is required for (e.g., ["custody", "birth-registration"])
  estimatedTime?: string; // How long this takes (e.g., "30 minutes", "1-2 weeks")
  location?: string; // Where to do this (e.g., "Standesamt", "Jugendamt", "Online")
  cost?: string; // If there's a cost (e.g., "Free", "€25-50")
  helpLink?: string; // Link to guide or resource
}

/**
 * City-specific resource (Standesamt, Jugendamt, etc.)
 */
export interface CityResource {
  city: string;
  postcode: string;
  standesamt: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
    appointmentRequired: boolean;
  };
  jugendamt: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
    appointmentRequired: boolean;
  };
  notes?: string; // Special notes about this city's procedures
}

/**
 * User's current situation for personalized checklist
 */
export interface UserSituation {
  relationshipStatus: "married" | "unmarried" | "separated" | "other";
  pregnancyStage?:
    | "planning"
    | "first-trimester"
    | "second-trimester"
    | "third-trimester"
    | "postpartum";
  childAge?: "not-born" | "0-3-months" | "3-6-months" | "6-12-months" | "1-2-years" | "older";
  hasPaternityCertificate: boolean;
  hasJointCustody: boolean;
  relationshipStable: boolean;
  city?: string;
}

/**
 * Personalized checklist generated based on user situation
 */
export interface PersonalizedChecklist {
  situation: UserSituation;
  priorityItems: ChecklistItem[];
  recommendedGuides: PlanningGuide[];
  cityResources?: CityResource;
  nextSteps: string[];
}

/**
 * Planning data structure (what goes in planning.json)
 */
export interface PlanningData {
  guides: PlanningGuide[];
  checklist: ChecklistItem[];
  cityResources: CityResource[];
}
