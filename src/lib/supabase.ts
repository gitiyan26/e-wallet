import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for authentication
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  // Ensure user profile exists after successful login
  if (data.user && !error) {
    try {
      // Wait a bit for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { ensureUserProfile } = await import('./database')
      await ensureUserProfile()
    } catch (profileError) {
      console.error('Error ensuring user profile:', profileError)
      // Don't throw error, let login continue
    }
  }
  
  return { data, error }
}

export const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  
  // Ensure user profile exists after successful signup
  if (data.user && !error) {
    try {
      // Wait a bit for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { ensureUserProfile } = await import('./database')
      await ensureUserProfile()
    } catch (profileError) {
      console.error('Error ensuring user profile after signup:', profileError)
      // Don't throw error, let registration continue
    }
  }
  
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          type: 'income' | 'expense'
          amount: number
          description: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          type: 'income' | 'expense'
          amount: number
          description?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          type?: 'income' | 'expense'
          amount?: number
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}