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
