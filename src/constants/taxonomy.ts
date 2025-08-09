export const SECTORS = ['Law Enforcement', 'Cross-sector', 'Water'];
export const FUNCTIONS = ['IR', 'Regulator', 'Research'];
export const AGENCIES = ['FBI', 'FEMA', 'EPA'];
export const STATES = ['MA', 'NY', 'DC'];
export const BADGES = ['Cross-sector', 'Law Enforcement', 'IR', 'Regulator', 'Research'];
export type Filters = {
  sectors?: string[];
  functions?: string[];
  agencies?: string[];
  states?: string[];
};
