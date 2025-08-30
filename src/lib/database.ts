// Database layer untuk mengelola data transaksi menggunakan Supabase
import { Transaction, User, TransactionFilter, TransactionSummary } from '@/types';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Types untuk Supabase
interface SupabaseTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  created_at: string;
}

interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Helper function to convert Supabase transaction to app transaction
const convertSupabaseTransaction = (supabaseTransaction: SupabaseTransaction, categories: SupabaseCategory[]): Transaction => {
  const category = categories.find(c => c.id === supabaseTransaction.category_id);
  return {
    id: supabaseTransaction.id,
    user_id: supabaseTransaction.user_id,
    type: supabaseTransaction.type,
    amount: supabaseTransaction.amount,
    description: supabaseTransaction.description || '',
    category: category?.name || 'Lainnya',
    date: supabaseTransaction.date,
    created_at: supabaseTransaction.created_at,
    updated_at: supabaseTransaction.updated_at
  };
};

// Initialize database (no longer needed for Supabase)
export const initializeDatabase = async () => {
  // Database initialization is handled by Supabase migrations
  return true;
};

// Transaction operations
export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>, userToken?: string): Promise<Transaction> => {
  try {
    let supabaseClient = supabase;
    
    // If userToken is provided, create a new client with the token
    if (userToken) {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Set the session with the provided token
      await supabaseClient.auth.setSession({
        access_token: userToken,
        refresh_token: '' // We don't have refresh token in this context
      });
    }
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get categories to find category_id
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('name', transactionData.category)
      .eq('type', transactionData.type)
      .single();

    if (categoriesError) {
      // Category not found, using null
    }

    // Insert transaction
    const { data, error } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        category_id: categories?.id || null,
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description,
        date: transactionData.date
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get all categories for conversion
    const { data: allCategories } = await supabaseClient
      .from('categories')
      .select('*');

    return convertSupabaseTransaction(data, allCategories || []);
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async (filter?: TransactionFilter, authenticatedUser?: any, userToken?: string): Promise<Transaction[]> => {
  try {
    let user = authenticatedUser;
    let supabaseClient = supabase;
    
    // If no authenticated user provided, try to get current user with retry mechanism
    if (!user) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && currentUser) {
          user = currentUser;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!user) {
      // Return empty array if user not authenticated
      return [];
    }

    // Create a new client with the user token for RLS
    if (userToken) {
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          }
        }
      );
    } else {
      // Fallback to session-based auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabaseClient.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
    }

    // Build query
    let query = supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (filter) {
      if (filter.type && filter.type !== 'all') {
        query = query.eq('type', filter.type);
      }
      if (filter.dateFrom) {
        query = query.gte('date', filter.dateFrom);
      }
      if (filter.dateTo) {
        query = query.lte('date', filter.dateTo);
      }
    }

    // Order by date (newest first)
    query = query.order('date', { ascending: false });

    // Apply limit and offset
    if (filter?.limit) {
      const offset = filter.offset || 0;
      query = query.range(offset, offset + filter.limit - 1);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw error;
    }

    // Get categories
    const { data: categories } = await supabaseClient
      .from('categories')
      .select('*');

    // Convert and filter by category if needed
    let convertedTransactions = (transactions || []).map(t => convertSupabaseTransaction(t, categories || []));

    if (filter?.category) {
      convertedTransactions = convertedTransactions.filter(t => t.category === filter.category);
    }

    return convertedTransactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transaction) {
      return null;
    }

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    return convertSupabaseTransaction(transaction, categories || []);
  } catch (error) {
    console.error('Error getting transaction by id:', error);
    return null;
  }
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction | null> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.type) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date) updateData.date = updates.date;

    // Handle category update
    if (updates.category) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', updates.category)
        .eq('type', updates.type || 'expense')
        .single();
      
      updateData.category_id = category?.id || null;
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    return convertSupabaseTransaction(data, categories || []);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return !error;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

// Summary operations
export const getTransactionSummary = async (authenticatedUser?: any, userToken?: string): Promise<TransactionSummary> => {
  try {
    let user = authenticatedUser;
    let supabaseClient = supabase;
    
    // If no authenticated user provided, try to get current user with retry mechanism
    if (!user) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && currentUser) {
          user = currentUser;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!user) {
      // Return empty summary if user not authenticated
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0
      };
    }

    // Create a new client with the user token for RLS
    if (userToken) {
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          }
        }
      );
    } else {
      // Fallback to session-based auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabaseClient.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }
    }

    const { data: transactions, error } = await supabaseClient
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    const totalIncome = (transactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = (transactions || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: (transactions || []).length
    };
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0
    };
  }
};

export const getTransactionsByUserAndDateRange = async (startDate: Date, endDate: Date, authenticatedUser?: any): Promise<Transaction[]> => {
  try {
    let user = authenticatedUser;
    
    // If no authenticated user provided, try to get current user with retry mechanism
    if (!user) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && currentUser) {
          user = currentUser;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    return (transactions || []).map(t => convertSupabaseTransaction(t, categories || []));
  } catch (error) {
    console.error('Error getting transactions by date range:', error);
    return [];
  }
};

// Category operations
export const getCategories = async () => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    // Group by type
    const grouped = {
      income: categories?.filter(c => c.type === 'income').map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as 'income',
        icon: c.icon || '💰',
        color: c.color || '#10B981'
      })) || [],
      expense: categories?.filter(c => c.type === 'expense').map(c => ({
        id: c.id,
        name: c.name,
        type: c.type as 'expense',
        icon: c.icon || '💸',
        color: c.color || '#EF4444'
      })) || []
    };

    return grouped;
  } catch (error) {
    console.error('Error getting categories:', error);
    // Return default categories as fallback
    return {
      income: [
        { id: '1', name: 'Gaji', type: 'income' as const, icon: '💰', color: '#10B981' },
        { id: '2', name: 'Freelance', type: 'income' as const, icon: '💻', color: '#3B82F6' },
        { id: '3', name: 'Investasi', type: 'income' as const, icon: '📈', color: '#8B5CF6' },
        { id: '4', name: 'Lainnya', type: 'income' as const, icon: '💵', color: '#6B7280' }
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
  }
};

export const getCategoriesByType = async (type: 'income' | 'expense') => {
  const categories = await getCategories();
  return categories[type] || [];
};

// User operations
export const saveUserData = async (userData: Partial<User>): Promise<User | null> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: userData.email || user.email || '',
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url
    };
  } catch (error) {
    console.error('Error saving user data:', error);
    return null;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      // Profile doesn't exist, create it
      await ensureUserProfile();
      
      // Try to get the profile again
      const { data: newData, error: newError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (newError || !newData) {
        return null;
      }
      
      return {
        id: newData.id,
        email: newData.email,
        full_name: newData.full_name,
        avatar_url: newData.avatar_url,
        created_at: newData.created_at,
        updated_at: newData.updated_at
      };
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Function to ensure user profile exists
export const ensureUserProfile = async (): Promise<void> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Initialize database on import (no longer needed for Supabase)
initializeDatabase();