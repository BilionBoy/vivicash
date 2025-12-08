export type TransactionType = 'income' | 'expense' | 'investment';

export enum Category {
  SALARY = 'Salário',
  FREELANCE = 'Extra/Freelance',
  DIVIDENDS = 'Dividendos',
  FOOD = 'Alimentação',
  HOUSING = 'Moradia',
  TRANSPORT = 'Transporte',
  HEALTH = 'Saúde',
  LEISURE = 'Lazer',
  EDUCATION = 'Educação',
  STOCKS = 'Ações/FIIs',
  FIXED_INCOME = 'Renda Fixa',
  CRYPTO = 'Cripto',
  OTHER = 'Outros'
}

export interface FamilyMember {
  id: string;
  name: string;
  avatarColor: string;
  monthlyBudget?: number; // Meta de gastos mensal
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO String
  dueDate?: string; // For bills
  type: TransactionType;
  category: Category | string;
  memberId: string; // Linked to FamilyMember
  isPaid: boolean;
}

export type ThemeColor = 'amber' | 'emerald' | 'blue' | 'rose' | 'violet' | 'slate';

export interface FinancialState {
  transactions: Transaction[];
  members: FamilyMember[];
  themeColor: ThemeColor;
}