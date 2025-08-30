'use client'

import { supabase } from './supabase'
import { addTransaction, saveUserData } from './database'

// Interface untuk data localStorage
interface LocalStorageTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  user_id: string
}

interface LocalStorageUser {
  id: string
  email: string
  name?: string
}

// Fungsi untuk migrasi data dari localStorage ke Supabase
export async function migrateFromLocalStorage(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Cek apakah user sudah login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        message: 'User harus login terlebih dahulu untuk melakukan migrasi'
      }
    }

    let migratedCount = 0
    let errors: string[] = []

    // Migrasi transaksi
    const transactionsData = localStorage.getItem('transactions')
    if (transactionsData) {
      try {
        const transactions: LocalStorageTransaction[] = JSON.parse(transactionsData)
        
        for (const transaction of transactions) {
          try {
            // Konversi format tanggal jika diperlukan
            const transactionDate = new Date(transaction.date)
            if (isNaN(transactionDate.getTime())) {
              errors.push(`Transaksi dengan ID ${transaction.id} memiliki format tanggal yang tidak valid`)
              continue
            }

            // Tambahkan transaksi ke Supabase
            await addTransaction({
              type: transaction.type,
              amount: transaction.amount,
              category: transaction.category,
              description: transaction.description,
              date: transaction.date,
              user_id: user.id
            })
            
            migratedCount++
          } catch (error) {
            errors.push(`Gagal migrasi transaksi ${transaction.id}: ${error}`)
          }
        }
      } catch (error) {
        errors.push(`Gagal parsing data transaksi: ${error}`)
      }
    }

    // Migrasi data user (jika ada)
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const localUser: LocalStorageUser = JSON.parse(userData)
        
        // Simpan data user ke Supabase
        await saveUserData({
          id: user.id,
          email: user.email || localUser.email,
          name: localUser.name
        })
      } catch (error) {
        errors.push(`Gagal migrasi data user: ${error}`)
      }
    }

    // Bersihkan localStorage setelah migrasi berhasil (opsional)
    if (errors.length === 0) {
      const confirmClear = confirm(
        `Migrasi berhasil! ${migratedCount} transaksi telah dipindahkan ke Supabase. ` +
        'Apakah Anda ingin menghapus data lama dari localStorage?'
      )
      
      if (confirmClear) {
        localStorage.removeItem('transactions')
        localStorage.removeItem('user')
        localStorage.removeItem('demo-logged-in')
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Migrasi berhasil! ${migratedCount} transaksi telah dipindahkan ke Supabase.`
        : `Migrasi selesai dengan ${errors.length} error. ${migratedCount} transaksi berhasil dipindahkan.`,
      details: {
        migratedCount,
        errors
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Gagal melakukan migrasi: ${error}`,
      details: { error }
    }
  }
}

// Fungsi untuk cek apakah ada data di localStorage yang perlu dimigrasi
export function hasLocalStorageData(): boolean {
  const transactions = localStorage.getItem('transactions')
  const user = localStorage.getItem('user')
  
  return !!(transactions || user)
}

// Fungsi untuk mendapatkan statistik data localStorage
export function getLocalStorageStats(): { transactionCount: number; hasUserData: boolean } {
  let transactionCount = 0
  let hasUserData = false

  const transactionsData = localStorage.getItem('transactions')
  if (transactionsData) {
    try {
      const transactions = JSON.parse(transactionsData)
      transactionCount = Array.isArray(transactions) ? transactions.length : 0
    } catch (error) {
      console.error('Error parsing transactions data:', error)
    }
  }

  const userData = localStorage.getItem('user')
  hasUserData = !!userData

  return {
    transactionCount,
    hasUserData
  }
}