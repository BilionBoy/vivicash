import { FinancialState, FamilyMember, Transaction, ThemeColor } from '../types';

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
    const payload = {
      version: 1,
      timestamp: Date.now(),
      data: state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // fail silently but log for dev
    // eslint-disable-next-line no-console
    console.warn('Failed to save state to localStorage', e);
  }
};

export const loadState = (): FinancialState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;

    const parsed = JSON.parse(raw);
    // Backwards-compatible: if someone saved plain state, use it directly
    const candidate = parsed && parsed.data ? parsed.data : parsed;

    // Basic validation
    if (!candidate || !Array.isArray(candidate.transactions) || !Array.isArray(candidate.members)) {
      return INITIAL_STATE;
    }

    // Ensure members have expected shape (safe defaults)
    const members = candidate.members.map((m: any) => ({
      id: String(m.id || cryptoRandomId()),
      name: String(m.name || 'Membro'),
      avatarColor: String(m.avatarColor || 'bg-slate-500'),
      monthlyBudget: typeof m.monthlyBudget === 'number' ? m.monthlyBudget : 0,
    }));

    const transactions = candidate.transactions.map((t: any) => ({
      id: String(t.id || cryptoRandomId()),
      description: String(t.description || ''),
      amount: typeof t.amount === 'number' ? t.amount : 0,
      // preserve any extra fields if present
      ...t,
    }));

    return {
      transactions,
      members,
      themeColor: (candidate.themeColor as ThemeColor) || INITIAL_STATE.themeColor,
    } as FinancialState;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load state from localStorage, using initial state', e);
    return INITIAL_STATE;
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
};

// minimal id generator fallback
function cryptoRandomId() {
  try {
    return (crypto && crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2, 9);
  } catch {
    return Math.random().toString(36).slice(2, 9);
  }
}