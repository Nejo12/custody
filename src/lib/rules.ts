export type AnswerValue = "yes" | "no" | "unsure" | string;
export type Answers = Record<string, AnswerValue>;

export type Citation = { label?: string; url: string; snapshotId?: string };

export type Outcome = {
  status: string;
  message?: string;
  actions?: string[];
  citations?: Citation[] | string[];
};

export type SimpleRule = {
  id: string;
  version?: string;
  // Simple rules (v0.1): inputs is a map of key->expected value
  inputs?: Record<string, AnswerValue>;
  // JSON-logic style
  logic?: any;
  outcome: Outcome;
};

// Minimal JSON-logic evaluator supporting {all:[...]}, {any:[...]}, {"==":[a,b]}, {var:"key"}
function evalLogic(expr: any, data: Answers): boolean {
  if (!expr) return false;
  if (typeof expr === "boolean") return expr;
  if (Array.isArray(expr)) return expr.every((e) => evalLogic(e, data));
  if (typeof expr === "object") {
    if (Object.prototype.hasOwnProperty.call(expr, "all")) {
      return (expr.all as any[]).every((e) => evalLogic(e, data));
    }
    if (Object.prototype.hasOwnProperty.call(expr, "any")) {
      return (expr.any as any[]).some((e) => evalLogic(e, data));
    }
    if (Object.prototype.hasOwnProperty.call(expr, "==")) {
      const [a, b] = expr["=="]; // eslint-disable-line dot-notation
      const av = resolve(a, data);
      const bv = resolve(b, data);
      return av === bv;
    }
    if (Object.prototype.hasOwnProperty.call(expr, "!=")) {
      const [a, b] = expr["!="]; // eslint-disable-line dot-notation
      const av = resolve(a, data);
      const bv = resolve(b, data);
      return av !== bv;
    }
  }
  return false;
}

function resolve(node: any, data: Answers): any {
  if (typeof node === "object" && node && Object.prototype.hasOwnProperty.call(node, "var")) {
    return data[node.var as string];
  }
  return node;
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
};

export function evaluateRules(rules: SimpleRule[], answers: Answers): Evaluation {
  const matched = rules.filter((r) => matchesSimple(r, answers));
  const primary = matched[0];
  return { matched, primary };
}

