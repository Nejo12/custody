export type ClarifyRequest = {
  questionId: string;
  questionText?: string;
  answers: Record<string, string>;
  locale?: string;
  context?: string;
};

export type ClarifySuggestion = "yes" | "no" | "unsure";

export type ClarifyResponse = {
  suggestion: ClarifySuggestion;
  confidence: number; // 0..1
  followup?: string;
  reasoning?: string;
};

// Schedule Optimizer
export type ScheduleSuggestRequest = {
  locale?: string;
  distance: "local" | "regional" | "far";
  childUnderThree?: boolean;
  workHours?: string; // free text like Mon-Fri 9-17
  specialNotes?: string;
  city?: "berlin" | "hamburg" | "nrw";
  courtName?: string;
};

export type ScheduleSuggestResponse = {
  weekday: Partial<
    Record<
      "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
      string
    >
  >;
  weekend?: { even?: string; odd?: string };
  handover?: { location?: string; notes?: string };
  summary?: string;
};

// Evidence Summarizer
export type SummarizeRequest = {
  locale?: string;
  text: string; // raw pasted chats/notes
};

export type TimelineItem = { date?: string; text: string };

export type SummarizeResponse = {
  items: TimelineItem[];
  notes?: string; // optional overall notes
};

export type NeutralizeRequest = {
  text: string;
  tone?: "neutral" | "polite" | "assertive";
  locale?: string;
};

export type NeutralizeResponse = {
  text: string;
};
