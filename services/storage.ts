import { FinancialState, FamilyMember, Transaction } from '../types';

const STORAGE_KEY = 'vivicash_data_v1';

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Eu', avatarColor: 'bg-blue-500', monthlyBudget: 0 },
  { id: '2', name: 'Cônjuge', avatarColor: 'bg-purple-500', monthlyBudget: 0 },
  { id: '3', name: 'Filhos', avatarColor: 'bg-green-500', monthlyBudget: 0 },
  { id: '4', name: 'Casa', avatarColor: 'bg-gray-500', monthlyBudget: 0 },
];

const INITIAL_STATE: FinancialState = {
  transactions: [],
  members: DEFAULT_MEMBERS,
  themeColor: 'amber', // Default Gold Theme
};

export const saveState = (state: FinancialState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const loadState = (): FinancialState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return INITIAL_STATE;
    const data = JSON.parse(serialized);
    // Merge with initial state to ensure new fields (like themeColor) exist if loading old data
    return { ...INITIAL_STATE, ...data };
  } catch (e) {
    console.error('Failed to load state', e);
    return INITIAL_STATE;
  }
};