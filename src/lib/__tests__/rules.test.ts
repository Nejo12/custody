import { describe, it, expect } from 'vitest';
import rulesData from '@/data/rules.json';
import { evaluateRules, matchesSimple, Answers, SimpleRule, JSONLogicExpression } from '../rules';

describe('rules engine', () => {
  describe('evaluateRules', () => {
    it('detects married default joint custody', () => {
      const answers: Answers = { married_at_birth: 'yes' };
      const { primary } = evaluateRules(rulesData as SimpleRule[], answers);
      expect(primary?.outcome.status).toBe('joint_custody_default');
    });

    it('detects eligibility for joint custody for unmarried with ack', () => {
      const answers: Answers = {
        married_at_birth: 'no',
        paternity_ack: 'yes',
        joint_declaration: 'no',
        court_order: 'none',
      };
      const { matched } = evaluateRules(rulesData as SimpleRule[], answers);
      expect(matched.some(r => r.outcome.status === 'eligible_joint_custody')).toBe(true);
    });

    it('suggests contact order when contact is blocked', () => {
      const answers: Answers = { blocked_contact: 'yes' };
      const { primary } = evaluateRules(rulesData as SimpleRule[], answers);
      expect(primary?.outcome.status).toBe('apply_contact_order');
    });

    it('returns empty matched array when no rules match', () => {
      const answers: Answers = { unknown_field: 'value' };
      const { matched, primary } = evaluateRules(rulesData as SimpleRule[], answers);
      expect(matched).toEqual([]);
      expect(primary).toBeUndefined();
    });

    it('returns multiple matched rules when applicable', () => {
      const answers: Answers = { 
        married_at_birth: 'yes',
        blocked_contact: 'yes',
      };
      const { matched } = evaluateRules(rulesData as SimpleRule[], answers);
      expect(matched.length).toBeGreaterThan(1);
    });

    it('sets primary as first matched rule', () => {
      const answers: Answers = { married_at_birth: 'yes' };
      const { matched, primary } = evaluateRules(rulesData as SimpleRule[], answers);
      expect(primary).toBe(matched[0]);
    });
  });

  describe('matchesSimple', () => {
    it('matches rule with simple inputs', () => {
      const rule: SimpleRule = {
        id: 'test',
        inputs: { key1: 'value1', key2: 'value2' },
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'value1', key2: 'value2' };
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('does not match when input value differs', () => {
      const rule: SimpleRule = {
        id: 'test',
        inputs: { key1: 'value1' },
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'different' };
      expect(matchesSimple(rule, answers)).toBe(false);
    });

    it('does not match when input key is missing', () => {
      const rule: SimpleRule = {
        id: 'test',
        inputs: { key1: 'value1' },
        outcome: { status: 'test' },
      };
      const answers: Answers = {};
      expect(matchesSimple(rule, answers)).toBe(false);
    });

    it('matches rule with logic expression (==)', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: { '==': [{ var: 'key1' }, 'value1'] } as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'value1' };
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('matches rule with logic expression (!=)', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: { '!=': [{ var: 'key1' }, 'value1'] } as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'value2' };
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('matches rule with all logic', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: {
          all: [
            { '==': [{ var: 'key1' }, 'value1'] },
            { '==': [{ var: 'key2' }, 'value2'] },
          ],
        } as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'value1', key2: 'value2' };
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('does not match all logic when one condition fails', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: {
          all: [
            { '==': [{ var: 'key1' }, 'value1'] },
            { '==': [{ var: 'key2' }, 'value2'] },
          ],
        } as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'value1', key2: 'wrong' };
      expect(matchesSimple(rule, answers)).toBe(false);
    });

    it('matches rule with any logic', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: {
          any: [
            { '==': [{ var: 'key1' }, 'value1'] },
            { '==': [{ var: 'key2' }, 'value2'] },
          ],
        } as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = { key1: 'value1' };
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('returns false for rule with no inputs or logic', () => {
      const rule: SimpleRule = {
        id: 'test',
        outcome: { status: 'test' },
      };
      const answers: Answers = {};
      expect(matchesSimple(rule, answers)).toBe(false);
    });

    it('handles boolean true in logic', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: true as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = {};
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('handles boolean false in logic', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: false as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = {};
      expect(matchesSimple(rule, answers)).toBe(false);
    });

    it('handles complex nested logic', () => {
      const rule: SimpleRule = {
        id: 'test',
        logic: {
          all: [
            { '==': [{ var: 'married_at_birth' }, 'no'] },
            {
              any: [
                { '==': [{ var: 'paternity_ack' }, 'yes'] },
                { '==': [{ var: 'joint_declaration' }, 'yes'] },
              ],
            },
          ],
        } as JSONLogicExpression,
        outcome: { status: 'test' },
      };
      const answers: Answers = {
        married_at_birth: 'no',
        paternity_ack: 'yes',
      };
      expect(matchesSimple(rule, answers)).toBe(true);
    });

    it('handles empty inputs object', () => {
      const rule: SimpleRule = {
        id: 'test',
        inputs: {},
        outcome: { status: 'test' },
      };
      const answers: Answers = {};
      expect(matchesSimple(rule, answers)).toBe(true);
    });
  });

  it('considers supervised contact when safety concerns present', () => {
    const answers: Answers = { history_of_violence: 'yes' } as Answers;
    const { matched } = evaluateRules(rulesData as SimpleRule[], answers);
    expect(matched.some(r => r.outcome.status === 'consider_supervised_contact')).toBe(true);
  });
});
