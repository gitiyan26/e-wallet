// Database layer untuk mengelola data transaksi menggunakan localStorage
import { Transaction, User, TransactionFilter, TransactionSummary } from '@/types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'e-wallet-transactions',
  USER_DATA: 'e-wallet-user-data',
  CATEGORIES: 'e-wallet-categories'
};

// Default categories
const DEFAULT_CATEGORIES = {
  income: [
    { id: '1', name: 'Gaji', type: 'income' as const, icon: '💰', color: '#10B981' },
    { id: '2', name: 'Freelance', type: 'income' as const, icon: '💻', color: '#3B82F6' },
    { id: '3', name: 'Investasi', type: 'income' as const, icon: '📈', color: '#8B5CF6' },
    { id: '4', name: 'Bonus', type: 'income' as const, icon: '🎁', color: '#F59E0B' },
    { id: '5', name: 'Lainnya', type: 'income' as const, icon: '💵', color: '#6B7280' }
  ],
  expense: [
    { id: '6', name: 'Makanan', type: 'expense' as const, icon: '🍔', color: '#EF4444' },
    { id: '7', name: 'Transportasi', type: 'expense' as const, icon: '🚗', color: '#F97316' },
    { id: '8', name: 'Belanja', type: 'expense' as const, icon: '🛒', color: '#EC4899' },
    { id: '9', name: 'Tagihan', type: 'expense' as const, icon: '📄', color: '#DC2626' },
    { id: '10', name: 'Hiburan', type: 'expense' as const, icon: '🎬', color: '#7C3AED' },
    { id: '11', name: 'Kesehatan', type: 'expense' as const, icon: '🏥', color: '#059669' },
    { id: '12', name: 'Lainnya', type: 'expense' as const, icon: '💸', color: '#6B7280' }
  ]
};

// Initialize default data
export const initializeDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }
};

// Transaction operations
export const addTransaction = (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction => {
  const newTransaction: Transaction = {
    ...transactionData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return newTransaction; // Just return the transaction for server-side
  }
  
  const transactions = getTransactions();
  transactions.push(newTransaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  return newTransaction;
};

export const getTransactions = (filter?: TransactionFilter): Transaction[] => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    // Return mock data for server-side rendering
    return getMockTransactions(filter);
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  let transactions: Transaction[] = stored ? JSON.parse(stored) : [];
  
  if (filter) {
    if (filter.type && filter.type !== 'all') {
      transactions = transactions.filter(t => t.type === filter.type);
    }
    if (filter.category) {
      transactions = transactions.filter(t => t.category === filter.category);
    }
    if (filter.dateFrom) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(filter.dateFrom!));
    }
    if (filter.dateTo) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(filter.dateTo!));
    }
  }
  
  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (filter?.limit) {
    const offset = filter.offset || 0;
    transactions = transactions.slice(offset, offset + filter.limit);
  }
  
  return transactions;
};

export const getTransactionById = (id: string): Transaction | null => {
  const transactions = getTransactions();
  return transactions.find(t => t.id === id) || null;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | null => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null; // Return null for server-side
  }
  
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  transactions[index] = {
    ...transactions[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  return transactions[index];
};

export const deleteTransaction = (id: string): boolean => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return false; // Return false for server-side
  }
  
  const transactions = getTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  
  if (filteredTransactions.length === transactions.length) {
    return false; // Transaction not found
  }
  
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions));
  return true;
};

// Summary operations
export const getTransactionSummary = (userId: string): TransactionSummary => {
  const transactions = getTransactions().filter(t => t.user_id === userId);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length
  };
};

// Category operations
export const getCategories = () => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORIES;
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
};

export const getCategoriesByType = (type: 'income' | 'expense') => {
  const categories = getCategories();
  return categories[type] || [];
};

// Mock data for server-side rendering
function getMockTransactions(filter?: TransactionFilter): Transaction[] {
  const mockTransactions: Transaction[] = [
    {
      id: 'mock-1',
      user_id: 'demo-user',
      type: 'income',
      amount: 5000000,
      description: 'Gaji Bulanan',
      category: 'Gaji',
      date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'mock-2',
      user_id: 'demo-user',
      type: 'expense',
      amount: 150000,
      description: 'Belanja Groceries',
      category: 'Makanan',
      date: '2024-01-14',
      created_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-14T15:30:00Z'
    },
    {
      id: 'mock-3',
      user_id: 'demo-user',
      type: 'expense',
      amount: 50000,
      description: 'Bensin Motor',
      category: 'Transportasi',
      date: '2024-01-13',
      created_at: '2024-01-13T08:45:00Z',
      updated_at: '2024-01-13T08:45:00Z'
    }
  ];

  if (!filter) return mockTransactions;

  let filtered = mockTransactions;

  if (filter.type && filter.type !== 'all') {
    filtered = filtered.filter(t => t.type === filter.type);
  }

  if (filter.category) {
    filtered = filtered.filter(t => t.category === filter.category);
  }

  if (filter.dateFrom) {
    filtered = filtered.filter(t => new Date(t.date) >= new Date(filter.dateFrom!));
  }

  if (filter.dateTo) {
    filtered = filtered.filter(t => new Date(t.date) <= new Date(filter.dateTo!));
  }

  if (filter.limit) {
    const offset = filter.offset || 0;
    filtered = filtered.slice(offset, offset + filter.limit);
  }

  return filtered;
}

// User operations
export const saveUserData = (userData: Partial<User>) => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return userData; // Just return the data for server-side
  }
  
  const existing = getUserData();
  const updated = { ...existing, ...userData };
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updated));
  return updated;
};

export const getUserData = (): User | null => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null; // Return null for server-side
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return stored ? JSON.parse(stored) : null;
};

export const clearUserData = () => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return; // Skip for server-side
  }
  
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
};

// Initialize database on import
if (typeof window !== 'undefined') {
  initializeDatabase();
}