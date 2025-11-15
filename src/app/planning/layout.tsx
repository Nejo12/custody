import type { Metadata } from "next";
import { planningMetadata } from "./metadata";

export const metadata: Metadata = planningMetadata;

/**
 * Layout for Planning & Prevention section
 * Provides SEO metadata and structure for all planning pages
 */
export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
