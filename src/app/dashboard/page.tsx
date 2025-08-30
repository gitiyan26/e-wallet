'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

export default function DashboardPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.email}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-medium mb-2">Saldo Total</h2>
          <p className="text-3xl font-bold">Rp 0</p>
          <p className="text-blue-100 text-sm mt-2">Belum ada transaksi</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-green-600 text-2xl mb-2">💰</div>
            <p className="font-medium text-gray-900">Tambah Pemasukan</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-red-600 text-2xl mb-2">💸</div>
            <p className="font-medium text-gray-900">Tambah Pengeluaran</p>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">Belum ada transaksi</p>
          <p className="text-sm text-gray-500 mt-2">Mulai catat keuangan Anda sekarang</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}