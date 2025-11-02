export type Question = {
  id: string;
  type?: 'yn' | 'enum';
  options?: { value: string; label: string }[];
};

export const questions: Question[] = [
  { id: 'married_at_birth', type: 'yn' },
  { id: 'paternity_ack', type: 'yn' },
  { id: 'joint_declaration', type: 'yn' },
  { id: 'court_order', type: 'enum', options: [
    { value: 'none', label: 'No order' },
    { value: 'exists', label: 'Yes, order exists' },
    { value: 'unknown', label: 'Not sure' },
  ] },
  { id: 'blocked_contact', type: 'yn' },
  { id: 'living_together_currently', type: 'yn' },
  { id: 'child_age_under_three', type: 'yn' },
  { id: 'history_of_violence', type: 'yn' },
  { id: 'mediation_tried', type: 'yn' },
  { id: 'existing_visitation_plan', type: 'yn' },
  { id: 'distance_km', type: 'enum', options: [
    { value: 'local', label: '< 30 km' },
    { value: 'regional', label: '30–150 km' },
    { value: 'far', label: '> 150 km' },
    { value: 'unsure', label: 'Not sure' },
  ] },
  { id: 'parental_agreement_possible', type: 'yn' },
];

export default questions;

