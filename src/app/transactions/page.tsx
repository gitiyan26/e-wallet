'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import Link from 'next/link'

export default function TransactionsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Riwayat keuangan Anda</p>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div className="p-4">
        <Link
          href="/add-transaction"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">➕</span>
          Tambah Transaksi
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button className="flex-1 py-2 px-4 rounded-md bg-white text-blue-600 font-medium shadow-sm">
            Semua
          </button>
          <button className="flex-1 py-2 px-4 rounded-md text-gray-600 hover:text-blue-600">
            Pemasukan
          </button>
          <button className="flex-1 py-2 px-4 rounded-md text-gray-600 hover:text-blue-600">
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4">
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <p className="text-gray-600 font-medium">Belum ada transaksi</p>
          <p className="text-sm text-gray-500 mt-2">Transaksi yang Anda buat akan muncul di sini</p>
          <Link
            href="/add-transaction"
            className="inline-block mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Tambah Transaksi Pertama
          </Link>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}