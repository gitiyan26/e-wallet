// Types untuk aplikasi E-Wallet

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface Balance {
  user_id: string;
  total_balance: number;
  total_income: number;
  total_expense: number;
  last_updated: string;
}

// Form types
export interface TransactionFormData {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

// Filter types
export interface TransactionFilter {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}