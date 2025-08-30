// Fallback values untuk development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock Supabase client untuk demo
const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Simulasi login berhasil
      if (email === 'demo@example.com' && password === 'demo123') {
        return {
          data: {
            user: {
              id: 'demo-user-id',
              email: 'demo@example.com',
              created_at: new Date().toISOString()
            }
          },
          error: null
        }
      }
      return {
        data: { user: null },
        error: { message: 'Email atau password salah' }
      }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      // Simulasi register berhasil
      return {
        data: {
          user: {
            id: 'new-user-id',
            email,
            created_at: new Date().toISOString()
          }
        },
        error: null
      }
    },
    getUser: async () => {
      // Simulasi user sudah login (untuk demo)
      const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('demo-logged-in')
      if (isLoggedIn) {
        return {
          data: {
            user: {
              id: 'demo-user-id',
              email: 'demo@example.com',
              created_at: new Date().toISOString()
            }
          },
          error: null
        }
      }
      return {
        data: { user: null },
        error: null
      }
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('demo-logged-in')
      }
      return { error: null }
    }
  }
}

// Untuk demo purposes, kita akan menggunakan mock client
// Jika ingin menggunakan Supabase asli, uncomment baris di bawah dan set environment variables
let supabase: any

if (supabaseUrl && supabaseAnonKey) {
  // Uncomment baris di bawah jika ingin menggunakan Supabase asli
  // const { createClient } = require('@supabase/supabase-js')
  // supabase = createClient(supabaseUrl, supabaseAnonKey)
  supabase = mockSupabase
} else {
  supabase = mockSupabase
}

export { supabase }