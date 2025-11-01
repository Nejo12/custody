import { describe, it, expect } from 'vitest';
import rulesData from '@/data/rules.json';
import { evaluateRules, Answers } from '../rules';

describe('rules engine', () => {
  it('detects married default joint custody', () => {
    const answers: Answers = { married_at_birth: 'yes' };
    const { primary } = evaluateRules(rulesData as any, answers);
    expect(primary?.outcome.status).toBe('joint_custody_default');
  });

  it('detects eligibility for joint custody for unmarried with ack', () => {
    const answers: Answers = {
      married_at_birth: 'no',
      paternity_ack: 'yes',
      joint_declaration: 'no',
      court_order: 'none',
    };
    const { matched } = evaluateRules(rulesData as any, answers);
    expect(matched.some(r => r.outcome.status === 'eligible_joint_custody')).toBe(true);
  });

  it('suggests contact order when contact is blocked', () => {
    const answers: Answers = { blocked_contact: 'yes' };
    const { primary } = evaluateRules(rulesData as any, answers);
    expect(primary?.outcome.status).toBe('apply_contact_order');
  });
});

