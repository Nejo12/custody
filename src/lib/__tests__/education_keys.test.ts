import { describe, it, expect } from 'vitest';
import en from '@/data/education.en.json';
import de from '@/data/education.de.json';

const requiredKeys = [
  'married_at_birth',
  'paternity_ack',
  'blocked_contact',
  'joint_declaration',
  'court_order',
  'distance_km',
  'mediation_tried',
  'parental_agreement_possible',
];

describe('education content keys', () => {
  it('EN contains required keys', () => {
    for (const k of requiredKeys) {
      expect((en as Record<string, unknown>)[k]).toBeTruthy();
    }
  });
  it('DE contains required keys', () => {
    for (const k of requiredKeys) {
      expect((de as Record<string, unknown>)[k]).toBeTruthy();
    }
  });
});

