import type en from '@/i18n/en';

export type TranslationDict = typeof en;

export type Citation = { label?: string; url: string; snapshotId?: string };

export type FormData = Record<string, unknown>;

export type JSONLogicExpression =
  | boolean
  | string
  | number
  | { var: string }
  | { all: JSONLogicExpression[] }
  | { any: JSONLogicExpression[] }
  | { '==': [JSONLogicExpression, JSONLogicExpression] }
  | { '!=': [JSONLogicExpression, JSONLogicExpression] };

export type ErrorWithMessage = Error & {
  message: string;
};

