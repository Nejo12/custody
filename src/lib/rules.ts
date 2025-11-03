export type AnswerValue = "yes" | "no" | "unsure" | string;
export type Answers = Record<string, AnswerValue>;

export type Citation = { label?: string; url: string; snapshotId?: string };

export type Outcome = {
  status: string;
  message?: string;
  actions?: string[];
  citations?: Citation[] | string[];
};

export type JSONLogicExpression =
  | boolean
  | string
  | number
  | { var: string }
  | { all: JSONLogicExpression[] }
  | { any: JSONLogicExpression[] }
  | { '==': [JSONLogicExpression, JSONLogicExpression] }
  | { '!=': [JSONLogicExpression, JSONLogicExpression] };

export type SimpleRule = {
  id: string;
  version?: string;
  // Simple rules (v0.1): inputs is a map of key->expected value
  inputs?: Record<string, AnswerValue>;
  // JSON-logic style
  logic?: JSONLogicExpression;
  outcome: Outcome;
};

// Minimal JSON-logic evaluator supporting {all:[...]}, {any:[...]}, {"==":[a,b]}, {var:"key"}
function evalLogic(expr: JSONLogicExpression, data: Answers): boolean {
  if (!expr) return false;
  if (typeof expr === "boolean") return expr;
  if (typeof expr === "string" || typeof expr === "number") return false;
  if (typeof expr === "object" && !Array.isArray(expr)) {
    if (Object.prototype.hasOwnProperty.call(expr, "all")) {
      return (expr as { all: JSONLogicExpression[] }).all.every((e) => evalLogic(e, data));
    }
    if (Object.prototype.hasOwnProperty.call(expr, "any")) {
      return (expr as { any: JSONLogicExpression[] }).any.some((e) => evalLogic(e, data));
    }
    if (Object.prototype.hasOwnProperty.call(expr, "==")) {
      const [a, b] = (expr as { '==': [JSONLogicExpression, JSONLogicExpression] })['=='];
      const av = resolve(a, data);
      const bv = resolve(b, data);
      return av === bv;
    }
    if (Object.prototype.hasOwnProperty.call(expr, "!=")) {
      const [a, b] = (expr as { '!=': [JSONLogicExpression, JSONLogicExpression] })['!='];
      const av = resolve(a, data);
      const bv = resolve(b, data);
      return av !== bv;
    }
  }
  return false;
}

function resolve(node: JSONLogicExpression, data: Answers): AnswerValue | boolean | number | string {
  if (typeof node === "object" && node && !Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, "var")) {
    return data[(node as { var: string }).var];
  }
  return node as AnswerValue | boolean | number | string;
}

export function matchesSimple(rule: SimpleRule, answers: Answers): boolean {
  if (rule.inputs) {
      for (const [k, v] of Object.entries(rule.inputs)) {
        if (answers[k] !== v) return false;
      }
  }
  if (rule.logic) {
    return evalLogic(rule.logic, answers);
  }
  return !!rule.inputs; // if only inputs provided and all matched
}

export type Evaluation = {
  matched: SimpleRule[];
  primary?: SimpleRule;
  confidence: number; // 0..1
};

export function evaluateRules(rules: SimpleRule[], answers: Answers): Evaluation {
  const matched = rules.filter((r) => matchesSimple(r, answers));
  const primary = matched[0];
  // naive confidence: proportion of known answers vs. 12 baseline
  const answered = Object.values(answers).filter(v => v !== undefined && v !== 'unsure').length;
  const baseline = 12;
  const confidence = Math.min(1, Math.max(0.3, answered / baseline));
  return { matched, primary, confidence };
}
